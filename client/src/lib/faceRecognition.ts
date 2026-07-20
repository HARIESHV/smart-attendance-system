import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models from /models (served from client/public/models/).
 * Models are loaded only once — subsequent calls are no-ops.
 */
export const loadFaceModels = async (): Promise<void> => {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';

  // Pre-check: verify the manifest is reachable before loading all models
  try {
    const probe = await fetch(`${MODEL_URL}/tiny_face_detector_model-weights_manifest.json`);
    if (!probe.ok) {
      throw new Error(
        `Model manifest returned HTTP ${probe.status}.\n` +
        `URL: ${MODEL_URL}/tiny_face_detector_model-weights_manifest.json\n` +
        `Ensure model files exist in client/public/models/`
      );
    }
  } catch (probeErr: any) {
    console.error('❌ Face model probe failed:', probeErr.message);
    throw probeErr;
  }

  // Load each model individually so we can report exactly which one failed
  const models: Array<{ name: string; loader: () => Promise<void> }> = [
    { name: 'TinyFaceDetector',    loader: () => faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL) },
    { name: 'FaceLandmark68Net',   loader: () => faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL) },
    { name: 'FaceRecognitionNet',  loader: () => faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL) },
    { name: 'FaceExpressionNet',   loader: () => faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL) },
  ];

  for (const { name, loader } of models) {
    try {
      await loader();
      console.log(`  ✅ Loaded: ${name}`);
    } catch (err: any) {
      const msg = `Failed to load face-api model: ${name}\nReason: ${err?.message || err}`;
      console.error(`❌ ${msg}`);
      throw new Error(msg);
    }
  }

  modelsLoaded = true;
  console.log('✅ All face-api.js models loaded successfully');
};

/** Reset the loaded flag (useful in tests or hot-reload scenarios) */
export const resetModelCache = () => { modelsLoaded = false; };


/**
 * Detect all faces in a video/canvas element and return their full descriptors.
 */
export const detectAllFaces = async (
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>[]> => {
  const detections = await faceapi
    .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
};

/**
 * Get a single face descriptor from an image/video for registration.
 */
export const getSingleDescriptor = async (
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<Float32Array | null> => {
  const detection = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.6 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor || null;
};

/**
 * Build a FaceMatcher from stored descriptor entries.
 */
export const buildFaceMatcher = (
  entries: Array<{ label: string; descriptors: number[][] }>
): faceapi.FaceMatcher | null => {
  if (entries.length === 0) return null;

  const labeledDescriptors = entries
    .filter((e) => e.descriptors && e.descriptors.length > 0)
    .map(
      (e) =>
        new faceapi.LabeledFaceDescriptors(
          e.label,
          e.descriptors.map((d) => new Float32Array(d))
        )
    );

  if (labeledDescriptors.length === 0) return null;

  return new faceapi.FaceMatcher(labeledDescriptors, 0.6);
};

/**
 * Draw face detection boxes and labels on a canvas overlay.
 */
export const drawDetections = (
  canvas: HTMLCanvasElement,
  detections: faceapi.WithFaceDescriptor<any>[],
  matches: Array<{ label: string; distance: number }>,
  videoWidth: number,
  videoHeight: number
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const resized = faceapi.resizeResults(
    detections,
    { width: videoWidth, height: videoHeight }
  );

  resized.forEach((detection, i) => {
    const box = detection.detection.box;
    const match = matches[i];
    const isKnown = match && match.label !== 'unknown';

    // Draw box
    ctx.strokeStyle = isKnown ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Corner decorations
    const cornerSize = 12;
    ctx.strokeStyle = isKnown ? '#10b981' : '#ef4444';
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath(); ctx.moveTo(box.x, box.y + cornerSize); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + cornerSize, box.y); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(box.x + box.width - cornerSize, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + cornerSize); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - cornerSize); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + cornerSize, box.y + box.height); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(box.x + box.width - cornerSize, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - cornerSize); ctx.stroke();

    // Label background
    const label = isKnown ? match.label : 'Unknown';
    const confidence = isKnown ? `${Math.round((1 - match.distance) * 100)}%` : '';
    const displayText = `${label} ${confidence}`;

    ctx.font = '600 13px Inter, sans-serif';
    const textWidth = ctx.measureText(displayText).width;

    ctx.fillStyle = isKnown ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)';
    ctx.roundRect(box.x - 1, box.y - 26, textWidth + 12, 22, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(displayText, box.x + 5, box.y - 9);
  });
};

/**
 * Liveness check: compute Eye Aspect Ratio (EAR) to detect blinks.
 */
export const computeEAR = (landmarks: faceapi.FaceLandmarks68): number => {
  const lm = landmarks.positions;
  // Left eye: 36-41, Right eye: 42-47
  const eyeEAR = (eye: number[]) => {
    const A = dist(lm[eye[1]], lm[eye[5]]);
    const B = dist(lm[eye[2]], lm[eye[4]]);
    const C = dist(lm[eye[0]], lm[eye[3]]);
    return (A + B) / (2 * C);
  };
  const leftEAR = eyeEAR([36, 37, 38, 39, 40, 41]);
  const rightEAR = eyeEAR([42, 43, 44, 45, 46, 47]);
  return (leftEAR + rightEAR) / 2;
};

/**
 * Detect approximate brightness level from a video element.
 * Returns a value 0–255. Below ~40 is considered low light.
 */
export const computeLightLevel = (video: HTMLVideoElement): number => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;  // Sample at small resolution for performance
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 255;
  ctx.drawImage(video, 0, 0, 64, 48);
  const data = ctx.getImageData(0, 0, 64, 48).data;
  let total = 0;
  const pixels = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    // Luminance: 0.299R + 0.587G + 0.114B
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return total / pixels;
};

const dist = (a: faceapi.Point, b: faceapi.Point): number =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
