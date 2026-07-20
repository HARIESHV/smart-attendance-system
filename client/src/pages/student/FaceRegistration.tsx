import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import {
  Camera, CheckCircle, Loader2, AlertTriangle, ShieldCheck,
  WifiOff, RefreshCw, ArrowLeft, RotateCcw, Upload,
} from 'lucide-react';
import { loadFaceModels, getSingleDescriptor } from '../../lib/faceRecognition';
import { studentApi } from '../../api/student.api';
const checkCollegeNetwork = async () => ({ onCollegeNetwork: true });
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { DailyRegistrationStatus } from '../../types';

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepDot({ done, active }: { done: boolean; active: boolean }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
        done
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : active
          ? 'bg-primary-600 border-primary-600 text-white animate-pulse'
          : 'bg-gray-100 dark:bg-dark-600 border-gray-300 dark:border-dark-400 text-gray-400'
      }`}
    >
      {done ? <CheckCircle size={14} /> : active ? '●' : '○'}
    </div>
  );
}

export default function FaceRegistration() {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [descriptors, setDescriptors] = useState<Float32Array[]>([]);
  const [saving, setSaving] = useState(false);
  // NOTE: checkingStatus only gates the "already registered" redirect, not the UI
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [onNetwork, setOnNetwork] = useState(true);
  const [networkCheckDone, setNetworkCheckDone] = useState(false);
  const [status, setStatus] = useState<DailyRegistrationStatus | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  // Track model loading message for the in-camera overlay
  const [modelLoadMsg, setModelLoadMsg] = useState('Checking network…');

  const isInitial = !status?.isFaceRegistered;
  const REQUIRED_PHOTOS = isInitial ? 3 : 1;
  const progress = Math.min((descriptors.length / REQUIRED_PHOTOS) * 100, 100);
  const isComplete = descriptors.length >= REQUIRED_PHOTOS;

  // ── Init: network check + models (runs in background, page already visible) ─
  useEffect(() => {
    const init = async () => {
      try {
        setModelLoadMsg('Checking network…');
        const netRes = await checkCollegeNetwork().catch(() => ({ onCollegeNetwork: true }));
        setOnNetwork(netRes.onCollegeNetwork);
        setNetworkCheckDone(true);

        setModelLoadMsg('Fetching status…');
        const statusRes = await studentApi.getDailyRegistrationStatus().catch(() => null);
        setStatus(statusRes?.data || null);

        setModelLoadMsg('Loading AI models…');
        await loadFaceModels();
        setModelsLoaded(true);
      } catch (err: any) {
        console.error('FaceRegistration init error:', err);
        setModelLoadMsg('Load failed — refresh');
        toast.error('Could not load face recognition models. Please refresh.');
      } finally {
        setCheckingStatus(false);
      }
    };
    init();
  }, []);

  // ── Capture ────────────────────────────────────────────────────────────────
  const captureFace = useCallback(async () => {
    if (!webcamRef.current?.video || !modelsLoaded || capturing) return;

    setCapturing(true);
    try {
      const descriptor = await getSingleDescriptor(webcamRef.current.video);
      if (descriptor) {
        setDescriptors(prev => {
          const next = [...prev, descriptor];
          if (next.length >= REQUIRED_PHOTOS) {
            toast.success('All captures complete! Click "Submit" to register.');
          } else {
            toast.success(`Capture ${next.length}/${REQUIRED_PHOTOS} — move your head slightly.`);
          }
          return next;
        });
      } else {
        toast.error('No face detected — ensure good lighting and look at the camera.');
      }
    } catch {
      toast.error('Error processing face. Please try again.');
    } finally {
      setCapturing(false);
    }
  }, [modelsLoaded, capturing, REQUIRED_PHOTOS]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isComplete) return;
    setSaving(true);
    try {
      const serialized = descriptors.map(d => Array.from(d));
      if (isInitial) {
        await studentApi.saveFaceDescriptors({ descriptors: serialized });
        toast.success('Face registered permanently!');
      } else {
        await studentApi.saveDailyFaceDescriptors({ descriptors: serialized });
        toast.success('Daily face registration complete!');
      }
      navigate('/student');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  // ── Camera video constraints ───────────────────────────────────────────────
  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  };

  // ── No full-page loading spinner — page renders immediately.
  // The camera viewport shows its own loading overlay while models load.

  // ── Already done today ─────────────────────────────────────────────────────
  if (status?.registeredToday && !isInitial) {
    return (
      <div className="max-w-lg mx-auto mt-8 px-4">
        <div className="glass-card p-8 text-center border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10">
          <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
            Already Registered Today!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your daily face check-in for <strong>{status.date}</strong> is complete.
            Attendance will be marked automatically in your classes.
          </p>
          <button onClick={() => navigate('/student')} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-8">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-1 mt-2">
        <button
          onClick={() => navigate('/student')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-600 text-gray-500 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isInitial ? 'Face Registration' : 'Daily Check-in'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isInitial
              ? 'Register your face to enable automated attendance'
              : 'Quick daily check-in to activate attendance for today'}
          </p>
        </div>
      </div>

      {/* ── Network Warning (non-blocking) ── */}
      {networkCheckDone && !onNetwork && (
        <div className="mt-4 mb-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-3">
          <WifiOff className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Not on College Network
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
              Face registration should be done on campus Wi-Fi. Your registration may be rejected by the server.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 text-amber-600 hover:text-amber-700 dark:text-amber-400 p-1"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {/* ── Steps indicator (mobile-friendly) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-4 mb-6 px-1">
        {Array.from({ length: REQUIRED_PHOTOS }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 sm:gap-2 flex-1">
            <StepDot
              done={descriptors.length > i}
              active={descriptors.length === i}
            />
            {i < REQUIRED_PHOTOS - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-dark-500 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-500"
                  style={{ width: descriptors.length > i ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        ))}
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
          {descriptors.length}/{REQUIRED_PHOTOS}
        </span>
      </div>

      {/* ── Two-column on md+, stacked on mobile ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* ── LEFT: Camera Panel ── */}
        <div className="glass-card overflow-hidden rounded-2xl flex flex-col">

          {/* Camera viewport */}
          <div className="relative bg-black w-full aspect-video overflow-hidden">
            {/* ── Loading overlay — ONLY inside camera box ── */}
            {!modelsLoaded && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/85 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Loader2 className="animate-spin text-primary-400" size={40} />
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/20" />
                  </div>
                  <p className="text-white text-sm font-semibold">{modelLoadMsg}</p>
                  <p className="text-white/50 text-xs">Camera is ready — waiting for AI</p>
                </div>
              </div>
            )}

            {/* Webcam feed */}
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => toast.error('Camera access denied. Please allow camera in browser settings.')}
              className="absolute inset-0 w-full h-full object-cover"
              mirrored
            />

            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2/5 aspect-[3/4] border-2 border-white/30 border-dashed rounded-full opacity-60" />
            </div>

            {/* Corner guides */}
            {cameraReady && (
              <>
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-400 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-400 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary-400 rounded-br-lg" />
              </>
            )}

            {/* Capture count badge */}
            {descriptors.length > 0 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {descriptors.length}/{REQUIRED_PHOTOS} captured
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 bg-gray-50/50 dark:bg-dark-700/50">
            {/* Capture button */}
            <button
              onClick={captureFace}
              disabled={!modelsLoaded || !cameraReady || capturing || isComplete}
              className="flex-1 min-h-[44px] btn-primary flex items-center justify-center gap-2 py-3 text-sm sm:text-base"
            >
              {capturing ? (
                <><Loader2 className="animate-spin shrink-0" size={18} /> Processing…</>
              ) : isComplete ? (
                <><CheckCircle className="shrink-0" size={18} /> All Captured</>
              ) : (
                <><Camera className="shrink-0" size={18} /> Capture Angle {descriptors.length + 1}</>
              )}
            </button>

            {/* Retake / Reset */}
            {descriptors.length > 0 && !saving && (
              <button
                onClick={() => setDescriptors([])}
                className="min-h-[44px] sm:w-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-500 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 hover:text-red-600 transition-all text-sm font-medium"
              >
                <RotateCcw size={16} className="shrink-0" /> Retake
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Progress + Info Panel ── */}
        <div className="flex flex-col gap-4">

          {/* Progress card */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
              <ShieldCheck className="text-primary-500 shrink-0" size={20} />
              Registration Progress
            </h3>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-3 mb-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-violet-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-medium text-right text-gray-500 dark:text-gray-400 mb-4">
              {descriptors.length} / {REQUIRED_PHOTOS} photos
            </p>

            {/* Checklist */}
            <ul className="space-y-2.5 mb-5">
              <li className={`flex items-center gap-2.5 text-sm font-medium ${
                descriptors.length >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  descriptors.length >= 1 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-dark-600'
                }`}>
                  {descriptors.length >= 1 ? <CheckCircle size={12} /> : <span className="text-xs">1</span>}
                </div>
                Front face — look directly at camera
              </li>
              {isInitial && (
                <>
                  <li className={`flex items-center gap-2.5 text-sm font-medium ${
                    descriptors.length >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      descriptors.length >= 2 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-dark-600'
                    }`}>
                      {descriptors.length >= 2 ? <CheckCircle size={12} /> : <span className="text-xs">2</span>}
                    </div>
                    Slight left turn
                  </li>
                  <li className={`flex items-center gap-2.5 text-sm font-medium ${
                    descriptors.length >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      descriptors.length >= 3 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-dark-600'
                    }`}>
                      {descriptors.length >= 3 ? <CheckCircle size={12} /> : <span className="text-xs">3</span>}
                    </div>
                    Slight right turn
                  </li>
                </>
              )}
            </ul>

            {/* Submit button */}
            <button
              onClick={handleSave}
              disabled={!isComplete || saving}
              className="w-full min-h-[48px] btn-success flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {saving ? (
                <><Loader2 className="animate-spin shrink-0" size={18} /> Saving…</>
              ) : (
                <><Upload className="shrink-0" size={18} /> Submit &amp; Register</>
              )}
            </button>

            {!isComplete && (
              <p className="text-xs text-center text-gray-400 mt-2">
                Capture {REQUIRED_PHOTOS - descriptors.length} more photo{REQUIRED_PHOTOS - descriptors.length > 1 ? 's' : ''} to enable submission
              </p>
            )}
          </div>

          {/* Tips card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-800 dark:text-blue-300 min-w-0">
              <strong className="block mb-1.5">Tips for best results:</strong>
              <ul className="space-y-1 list-disc pl-4">
                <li>Use a well-lit environment</li>
                <li>Remove glasses, masks, or hats</li>
                <li>Keep your face centered in the oval guide</li>
                <li>Slightly turn your head between captures</li>
              </ul>
            </div>
          </div>

          {/* Student info (read-only) */}
          <div className="glass-card p-4 sm:p-5">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              Your Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Mode', value: isInitial ? 'Initial Registration' : 'Daily Check-in' },
                { label: 'Status', value: status?.isFaceRegistered ? '✅ Enrolled' : '⏳ Not Enrolled' },
                { label: 'Date', value: status?.date || new Date().toLocaleDateString('en-IN') },
                { label: 'Photos Required', value: `${REQUIRED_PHOTOS}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-dark-600/50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
