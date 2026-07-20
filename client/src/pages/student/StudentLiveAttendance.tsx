import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { io, Socket } from 'socket.io-client';
import { studentApi } from '../../api/student.api';
import { attendanceApi } from '../../api/attendance.api';
import {
  loadFaceModels,
  detectAllFaces,
  drawDetections,
  computeEAR,
  computeLightLevel,
} from '../../lib/faceRecognition';
import toast from 'react-hot-toast';
import { Loader2, Camera, StopCircle, CheckCircle, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';

const SESSION_DURATION_SEC = 30 * 60; // 30 minutes
const LOW_LIGHT_THRESHOLD = 40;

export default function StudentLiveAttendance() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // ─── Refs ────────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const matcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const isRunningRef = useRef(false);
  const rafIdRef = useRef<number>(0);
  const lastScanTimeRef = useRef<number>(0);

  // ─── State ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_SEC);
  const [scanStatus, setScanStatus] = useState<string>('idle');
  const [attendanceStatus, setAttendanceStatus] = useState<'pending' | 'requested' | 'approved' | 'rejected'>('pending');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    setSocket(newSocket);
    
    // Student joins their specific session room
    newSocket.emit('join:session', sessionId);

    newSocket.on('attendance:approved', (data) => {
      // Check if it's OUR approval
      const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user?._id;
      if (data.studentId === userId) {
        setAttendanceStatus('approved');
        stopCamera();
        toast.success('Your attendance has been approved by the faculty!');
      }
    });

    newSocket.on('attendance:rejected', (data) => {
      const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.user?._id;
      if (data.studentId === userId) {
        setAttendanceStatus('rejected');
        toast.error('Your attendance request was rejected by the faculty.');
        // Allow them to scan again
        setScanStatus('scanning');
        isRunningRef.current = true;
      }
    });

    const init = async () => {
      try {
        setScanStatus('loading_models');
        const [profileRes, models] = await Promise.all([
          studentApi.getProfile(),
          loadFaceModels(),
        ]);

        const profile = profileRes.data.profile;
        if (!profile || !profile.isFaceRegistered || profile.faceDescriptors.length === 0) {
          toast.error('You must register your face before joining live attendance.');
          navigate('/student/face-registration');
          return;
        }

        // Build matcher strictly for this student
        const descriptors = profile.faceDescriptors[0].descriptors.map((d: any) => new Float32Array(Object.values(d)));
        const labeledDescriptor = new faceapi.LabeledFaceDescriptors(profile.rollNo, descriptors);
        matcherRef.current = new faceapi.FaceMatcher([labeledDescriptor]);

        setModelsLoaded(true);
        setScanStatus('starting_camera');
        await startCamera();
      } catch (err) {
        toast.error('Failed to initialize session');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      newSocket.disconnect();
      stopCamera();
    };
  }, [sessionId, navigate]);

  // Timer Countdown
  useEffect(() => {
    if (attendanceStatus === 'approved' || timeLeft <= 0) {
      if (timeLeft <= 0 && attendanceStatus === 'pending') {
        setScanStatus('time_expired');
        stopCamera();
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, attendanceStatus]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      isRunningRef.current = true;
      setScanStatus('scanning');
      startDetectionLoop();
    } catch (err) {
      setScanStatus('camera_error');
      toast.error('Camera access denied or unavailable.');
    }
  };

  const stopCamera = useCallback(() => {
    isRunningRef.current = false;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const runDetectionFrame = useCallback(async () => {
    if (!isRunningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const matcher = matcherRef.current;

    if (!video || !canvas || video.readyState !== 4 || video.videoWidth === 0) {
      rafIdRef.current = requestAnimationFrame(runDetectionFrame);
      return;
    }

    const now = Date.now();
    // Throttle heavy detection to every 2 seconds
    if (now - lastScanTimeRef.current >= 2000) {
      lastScanTimeRef.current = now;
      
      const lightLevel = computeLightLevel(video);
      if (lightLevel < LOW_LIGHT_THRESHOLD) {
        setScanStatus('low_light');
        rafIdRef.current = requestAnimationFrame(runDetectionFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      try {
        const detections = await detectAllFaces(video);
        if (detections.length === 0) {
          setScanStatus('scanning');
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        } else if (detections.length > 1) {
          setScanStatus('multiple_faces');
        } else {
          const d = detections[0];
          if (matcher) {
            const bestMatch = matcher.findBestMatch(d.descriptor);
            const ear = computeEAR(d.landmarks);
            const isLive = ear > 0.15; // Basic Liveness

            if (bestMatch.label !== 'unknown' && bestMatch.distance < 0.6) {
              if (isLive) {
                setScanStatus('face_matched');
                
                // Submit request to faculty
                isRunningRef.current = false; // Pause scanning
                setAttendanceStatus('requested');
                try {
                  await attendanceApi.requestAttendance(sessionId!, { confidence: 1 - bestMatch.distance });
                  toast.success('Attendance request sent! Waiting for faculty approval.');
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Failed to request attendance');
                  isRunningRef.current = true; // Resume if failed
                  setAttendanceStatus('pending');
                }
              } else {
                setScanStatus('liveness_failed');
              }
            } else {
              setScanStatus('unknown_face');
            }
          }
        }
        drawDetections(canvas, detections, detections.map(d => matcher ? matcher.findBestMatch(d.descriptor) : { label: 'unknown', distance: 1 } as any), video.videoWidth, video.videoHeight);
      } catch (err) {
        console.error('Frame error', err);
      }
    }

    if (isRunningRef.current) {
      rafIdRef.current = requestAnimationFrame(runDetectionFrame);
    }
  }, [sessionId]);

  const startDetectionLoop = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(runDetectionFrame);
  }, [runDetectionFrame]);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white dark:bg-dark-800 p-4 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Camera className="text-primary-500" />
            Live Attendance
          </h1>
          <p className="text-sm text-gray-500">Ensure good lighting and face the camera directly.</p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-gray-200'}`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {attendanceStatus === 'approved' ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <CheckCircle className="text-emerald-500 w-24 h-24 mb-4" />
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Attendance Approved!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">Your faculty has approved your attendance request. You may close this page now.</p>
          <button onClick={() => navigate('/student')} className="btn-primary mt-6">Return to Dashboard</button>
        </div>
      ) : attendanceStatus === 'requested' ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center border-amber-200 dark:border-amber-900/50">
          <Loader2 className="text-amber-500 w-24 h-24 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">Waiting for Faculty Approval</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">Your face was successfully matched! We have sent a request to your faculty. Please wait here.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl relative bg-black aspect-video flex items-center justify-center border-4 border-dark-800">
          
          <video
            ref={videoRef}
            className="absolute w-full h-full object-cover"
            muted
            playsInline
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute w-full h-full object-cover z-10 pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />

          <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2">
            {scanStatus === 'scanning' ? <><span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" /> Scanning for your face...</> :
             scanStatus === 'low_light' ? <><ShieldAlert className="text-yellow-400 w-4 h-4" /> Environment is too dark</> :
             scanStatus === 'multiple_faces' ? <><AlertTriangle className="text-red-400 w-4 h-4" /> Multiple faces detected! Clear the background.</> :
             scanStatus === 'unknown_face' ? <><AlertTriangle className="text-red-400 w-4 h-4" /> Face does not match your registration</> :
             scanStatus === 'liveness_failed' ? <><AlertTriangle className="text-orange-400 w-4 h-4" /> Please blink to verify liveness</> :
             scanStatus === 'camera_error' ? <><ShieldAlert className="text-red-500 w-4 h-4" /> Camera Access Denied</> :
             scanStatus === 'time_expired' ? <><Clock className="text-red-500 w-4 h-4" /> Session Time Expired</> :
             <><Loader2 className="w-4 h-4 animate-spin" /> Initializing...</>}
          </div>

          {!modelsLoaded && scanStatus !== 'camera_error' && (
            <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center text-white">
              <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
              <p className="font-semibold text-lg">Loading AI Recognition Models...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
