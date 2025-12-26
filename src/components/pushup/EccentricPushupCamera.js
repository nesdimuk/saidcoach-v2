"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateElbowAngle } from "@/utils/pushup/angles";
import {
  computeChestY,
  computeHipY,
  detectEndEccentric,
  detectStartEccentric,
  validateEccentricRep,
} from "@/utils/pushup/motion";

const FEEDBACK_COLORS = {
  detecting: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  descending: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  valid: "border-green-500/40 bg-green-500/10 text-green-200",
  invalid: "border-red-500/40 bg-red-500/10 text-red-300",
};

const CONNECTORS = [
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
];

const FEEDBACK_MESSAGES = {
  detecting: "Detectando…",
  descending: "Descenso controlado…",
  valid: "Excéntrica válida",
  too_fast: "Muy rápido",
  too_short: "Tiempo insuficiente",
  too_long: "Pausa excesiva",
  too_shallow: "ROM insuficiente",
  hip_collapse: "Cadera caída primero",
};

export default function EccentricPushupCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const ctxRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const stateRef = useRef({
    phase: "idle",
    prevAngle: null,
    prevChestY: null,
    startTime: null,
    startChestY: null,
    startHipY: null,
    endTime: null,
    endChestY: null,
    endHipY: null,
    baselineChestY: null,
    torsoLength: null,
    depth: 0,
    currentDuration: 0,
    currentSpeed: 0,
    maxHipLead: 0,
    prevDepth: 0,
    stallFrames: 0,
    displayDepth: 0,
    displayDuration: 0,
    displaySpeed: 0,
  });

  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState({ tone: "detecting", message: FEEDBACK_MESSAGES.detecting });
  const feedbackStateRef = useRef(feedback);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({
    angle: 0,
    depth: 0,
    duration: 0,
    speed: 0,
    phase: "idle",
  });

  const setFeedbackWithReset = useCallback((tone, message, resetDelay = 2000) => {
    const next = { tone, message };
    if (feedbackStateRef.current.tone === tone && feedbackStateRef.current.message === message) {
      return;
    }
    feedbackStateRef.current = next;
    setFeedback(next);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    if (tone !== "detecting" && tone !== "descending") {
      feedbackTimeoutRef.current = setTimeout(() => {
        const reset = { tone: "detecting", message: FEEDBACK_MESSAGES.detecting };
        feedbackStateRef.current = reset;
        setFeedback(reset);
      }, resetDelay);
    }
  }, []);

  const drawSkeleton = useCallback((ctx, landmarks, width, height) => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.fillStyle = "rgba(255,255,255,0.9)";

    CONNECTORS.forEach(([aIdx, bIdx]) => {
      const a = landmarks[aIdx];
      const b = landmarks[bIdx];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.stroke();
    });

    landmarks.forEach((point) => {
      if (!point) return;
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, []);

  const chooseSide = (landmarks) => {
    const leftScore =
      (landmarks[11]?.visibility ?? 0) + (landmarks[13]?.visibility ?? 0) + (landmarks[15]?.visibility ?? 0);
    const rightScore =
      (landmarks[12]?.visibility ?? 0) + (landmarks[14]?.visibility ?? 0) + (landmarks[16]?.visibility ?? 0);
    const useLeft = leftScore >= rightScore;
    return {
      shoulder: landmarks[useLeft ? 11 : 12],
      elbow: landmarks[useLeft ? 13 : 14],
      wrist: landmarks[useLeft ? 15 : 16],
    };
  };

  const handlePoseResults = useCallback(
    (results) => {
      const landmarks = results?.poseLandmarks;
      if (!landmarks || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!ctxRef.current) {
        ctxRef.current = canvas.getContext("2d");
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
      }

      drawSkeleton(ctxRef.current, landmarks, canvas.width, canvas.height);

      const chestY = computeChestY(landmarks);
      const hipY = computeHipY(landmarks);
      const { shoulder, elbow, wrist } = chooseSide(landmarks);
      const elbowAngle = calculateElbowAngle(shoulder, elbow, wrist);

      if (chestY == null || hipY == null || elbowAngle == null) {
        return;
      }

      const state = stateRef.current;
      const frame = {
        elbowAngle,
        chestY,
        hipY,
        timestamp: performance.now(),
        leftShoulder: landmarks[11] ?? null,
        rightShoulder: landmarks[12] ?? null,
        leftHip: landmarks[23] ?? null,
        rightHip: landmarks[24] ?? null,
      };

      if (state.phase === "idle") {
        setFeedbackWithReset("detecting", FEEDBACK_MESSAGES.detecting, 0);
      }

      const started = detectStartEccentric(state, frame);
      if (started) {
        setFeedbackWithReset("descending", FEEDBACK_MESSAGES.descending, 0);
      }

      const finished = detectEndEccentric(state, frame);
      if (finished) {
        const result = validateEccentricRep(state);
        if (result.valid) {
          setRepCount((prev) => prev + 1);
          setFeedbackWithReset("valid", FEEDBACK_MESSAGES.valid);
        } else {
          const tone = "invalid";
          const message = FEEDBACK_MESSAGES[result.reason] ?? "Repetición inválida";
          setFeedbackWithReset(tone, message);
        }

        const metrics = result.metrics || {
          duration: state.currentDuration,
          speed: state.currentSpeed,
          depth: state.depth,
        };

        state.displayDepth = metrics.depth ?? 0;
        state.displayDuration = metrics.duration ?? 0;
        state.displaySpeed = metrics.speed ?? 0;

        state.phase = "idle";
        state.prevAngle = null;
        state.prevChestY = null;
        state.startTime = null;
        state.startChestY = null;
        state.startHipY = null;
        state.endTime = null;
        state.endChestY = null;
        state.endHipY = null;
        state.baselineChestY = null;
        state.torsoLength = null;
        state.depth = 0;
        state.prevDepth = 0;
        state.maxHipLead = 0;
        state.stallFrames = 0;
        state.currentDuration = 0;
        state.currentSpeed = 0;
      }

      state.prevAngle = frame.elbowAngle;
      state.prevChestY = frame.chestY;

      const depthForDebug = state.phase === "descending" ? state.depth ?? 0 : state.displayDepth ?? 0;
      const durationForDebug =
        state.phase === "descending" ? state.currentDuration ?? 0 : state.displayDuration ?? 0;
      const speedForDebug = state.phase === "descending" ? state.currentSpeed ?? 0 : state.displaySpeed ?? 0;

      setDebug({
        angle: Math.round(elbowAngle),
        depth: depthForDebug,
        duration: durationForDebug,
        speed: speedForDebug,
        phase: state.phase,
      });
    },
    [drawSkeleton, setFeedbackWithReset]
  );

  useEffect(() => {
    let mounted = true;
    let cleanupVideo = null;

    async function initPose() {
      try {
        const [{ Pose }, { Camera }] = await Promise.all([
          import("@mediapipe/pose"),
          import("@mediapipe/camera_utils"),
        ]);

        if (!mounted) return;

        poseRef.current = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
        });

        poseRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        poseRef.current.onResults(handlePoseResults);

        if (!videoRef.current) {
          setError("Cámara no disponible.");
          return;
        }

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!mounted || !poseRef.current) return;
            await poseRef.current.send({ image: videoRef.current });
          },
          width: 1280,
          height: 720,
        });

        cameraRef.current = camera;
        await camera.start();
        cleanupVideo = videoRef.current;
      } catch (cameraError) {
        console.error(cameraError);
        setError("No pudimos acceder a tu cámara o al modelo de pose.");
      }
    }

    initPose();

    return () => {
      mounted = false;
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      cameraRef.current?.stop?.();
      poseRef.current?.close?.();

      const tracks = cleanupVideo?.srcObject?.getTracks?.() ?? [];
      tracks.forEach((track) => track.stop());
    };
  }, [handlePoseResults]);

  return (
    <div className="w-full space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Repeticiones válidas</p>
          <p className="text-5xl font-semibold text-white">{repCount}</p>
        </div>
        <div
          className={`rounded-2xl border px-4 py-2 text-center text-sm font-semibold ${
            FEEDBACK_COLORS[feedback.tone] ?? FEEDBACK_COLORS.detecting
          }`}
        >
          {feedback.message}
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-black/80 pt-[56.25%]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>

      <div className="grid gap-3 text-xs text-gray-400 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Ángulo codo</p>
          <p className="text-xl font-semibold text-white">{debug.angle}°</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Profundidad</p>
          <p className="text-xl font-semibold text-white">{debug.depth.toFixed(3)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Tiempo excéntrico</p>
          <p className="text-xl font-semibold text-white">{debug.duration.toFixed(2)}s</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Velocidad</p>
          <p className="text-xl font-semibold text-white">{debug.speed.toFixed(3)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Estado</p>
          <p className="text-lg font-semibold text-white capitalize">{debug.phase}</p>
        </div>
      </div>

      <p className="text-center text-sm text-gray-300">
        Usa una vista lateral, controla el descenso por al menos 1.2 segundos y mantén la cadera alineada para
        sumar repeticiones excéntricas.
      </p>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
