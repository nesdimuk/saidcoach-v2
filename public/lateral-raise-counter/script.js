const repCountElement = document.getElementById("repCount");
const statusTextElement = document.getElementById("statusText");
const resetButton = document.getElementById("resetButton");
const sessionStatusElement = document.getElementById("sessionStatus");
const syncStatusElement = document.getElementById("syncStatus");
const refreshSessionButton = document.getElementById("refreshSession");
const videoElement = document.getElementById("inputVideo");
const canvasElement = document.getElementById("outputCanvas");
const canvasCtx = canvasElement.getContext("2d");

// Parámetros de detección (ángulo hombro-cadera)
const DOWN_THRESHOLD = 35;
const UP_THRESHOLD = 80;
const VISIBILITY_THRESHOLD = 0.6;
const READY_FRAMES_REQUIRED = 6;

let repCount = 0;
let wasBelowThreshold = false;
let readyForCounting = false;
let consecutiveReadyFrames = 0;
let currentSide = null;
let audioContext;

let loggedUser = null;
let pendingReps = 0;
let syncInProgress = false;

function updateCounterDisplay() {
  repCountElement.textContent = repCount;
  repCountElement.classList.remove("bump");
  void repCountElement.offsetWidth;
  repCountElement.classList.add("bump");
}

function updateStatus(text, highlight = false) {
  statusTextElement.textContent = text;
  statusTextElement.style.color = highlight ? "#E79C00" : "rgba(255,255,255,0.65)";
}

function notifySync(message, tone = "info") {
  const colors = {
    success: "#E79C00",
    error: "#ff6b6b",
    warn: "#ffd166",
    info: "rgba(255,255,255,0.6)",
  };
  syncStatusElement.textContent = message;
  syncStatusElement.style.color = colors[tone] || colors.info;
}

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playBeep() {
  ensureAudioContext();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.value = 880;

  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.28);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.3);
}

function resetCounter() {
  repCount = 0;
  wasBelowThreshold = false;
  readyForCounting = false;
  consecutiveReadyFrames = 0;
  currentSide = null;
  updateCounterDisplay();
  updateStatus("Reiniciado. Colócate de perfil y relaja tus brazos.");
}

async function checkSession() {
  try {
    const response = await fetch("/api/session", {
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (response.status === 401) {
      loggedUser = null;
      sessionStatusElement.innerHTML =
        'No detectamos sesión activa. Inicia sesión en <strong>saidcoach.com</strong> y vuelve a comprobar.';
      notifySync("Las repeticiones se guardarán cuando inicies sesión.", "warn");
      return;
    }

    if (!response.ok) {
      throw new Error("Respuesta inválida");
    }

    const body = await response.json();
    loggedUser = body.user ?? null;

    if (loggedUser) {
      sessionStatusElement.innerHTML = `Sesión activa: <strong>${loggedUser.email}</strong>. Tus repeticiones se sincronizan automáticamente.`;
      notifySync("Sesión sincronizada. ¡Comienza cuando quieras!", "success");
      processSyncQueue();
    } else {
      sessionStatusElement.innerHTML =
        'No detectamos sesión activa. Inicia sesión en <strong>saidcoach.com</strong>.';
      notifySync("Las repeticiones se guardarán cuando inicies sesión.", "warn");
    }
  } catch (error) {
    loggedUser = null;
    sessionStatusElement.textContent =
      "No pudimos comprobar tu sesión. Verifica tu conexión e inténtalo nuevamente.";
    notifySync("Error al comprobar la sesión.", "error");
  }
}

function queueRepSync(increment = 1) {
  if (!loggedUser) {
    return;
  }
  pendingReps += increment;
  processSyncQueue();
}

async function processSyncQueue() {
  if (!loggedUser || syncInProgress || pendingReps <= 0) {
    return;
  }

  syncInProgress = true;
  const repsToSync = pendingReps;
  pendingReps = 0;

  try {
    const response = await fetch("/api/squats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ reps: repsToSync }),
    });

    if (response.status === 401) {
      loggedUser = null;
      sessionStatusElement.innerHTML =
        'Tu sesión expiró. Inicia sesión nuevamente en <strong>saidcoach.com</strong>.';
      notifySync("Sesión expirada. Tus repeticiones quedarán pendientes.", "warn");
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "No se pudo registrar la repetición.");
    }

    notifySync(`¡Registramos ${repsToSync} rep(s) en tu cuenta!`, "success");
  } catch (error) {
    pendingReps += repsToSync;
    notifySync("No pudimos guardar tus repeticiones. Reintentaremos automáticamente.", "error");
  } finally {
    syncInProgress = false;
    if (pendingReps > 0) {
      processSyncQueue();
    }
  }
}

resetButton.addEventListener("click", () => {
  resetCounter();
});

refreshSessionButton.addEventListener("click", () => {
  checkSession();
});

window.addEventListener(
  "pointerdown",
  () => {
    ensureAudioContext();
  },
  { once: true }
);

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

function evaluateArm(landmarks, indices, name) {
  const shoulder = landmarks[indices.shoulder];
  const elbow = landmarks[indices.elbow];
  const wrist = landmarks[indices.wrist];
  const hip = landmarks[indices.hip];

  const ready =
    shoulder &&
    elbow &&
    wrist &&
    hip &&
    shoulder.visibility >= VISIBILITY_THRESHOLD &&
    elbow.visibility >= VISIBILITY_THRESHOLD &&
    wrist.visibility >= VISIBILITY_THRESHOLD &&
    hip.visibility >= VISIBILITY_THRESHOLD;

  const visibilityAvg = ready
    ? (shoulder.visibility + elbow.visibility + wrist.visibility + hip.visibility) / 4
    : 0;

  return {
    name,
    shoulder,
    elbow,
    wrist,
    hip,
    ready,
    visibilityAvg,
  };
}

function selectArmLandmarks(landmarks) {
  const right = evaluateArm(
    landmarks,
    { shoulder: 12, elbow: 14, wrist: 16, hip: 24 },
    "derecha"
  );
  const left = evaluateArm(
    landmarks,
    { shoulder: 11, elbow: 13, wrist: 15, hip: 23 },
    "izquierda"
  );

  const candidates = [right, left].filter((side) => side.ready);
  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => b.visibilityAvg - a.visibilityAvg);
  return candidates[0];
}

function onResults(results) {
  canvasElement.width = results.image.width;
  canvasElement.height = results.image.height;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    const landmarks = results.poseLandmarks;
    const selectedSide = selectArmLandmarks(landmarks);

    if (window.drawConnectors && window.drawLandmarks) {
      window.drawConnectors(canvasCtx, landmarks, window.POSE_CONNECTIONS, {
        color: "#E79C00",
        lineWidth: 4,
      });
      window.drawLandmarks(canvasCtx, landmarks, {
        color: "#ffffff",
        lineWidth: 1,
        radius: 2.5,
      });
    }

    if (!selectedSide) {
      updateStatus("No detecto bien tu brazo. Ponte de perfil y ajusta tu posición.");
      wasBelowThreshold = false;
      readyForCounting = false;
      consecutiveReadyFrames = 0;
      currentSide = null;
      canvasCtx.restore();
      return;
    }

    const { shoulder, elbow, hip, name: sideLabel } = selectedSide;

    if (currentSide !== sideLabel) {
      currentSide = sideLabel;
      readyForCounting = false;
      wasBelowThreshold = false;
      consecutiveReadyFrames = 0;
      updateStatus(`Detecto tu brazo ${sideLabel}. Relájalo a tu costado para comenzar.`);
    }

    const angle = calculateAngle(elbow, shoulder, hip);

    if (!readyForCounting) {
      if (angle >= UP_THRESHOLD) {
        consecutiveReadyFrames += 1;
        if (consecutiveReadyFrames >= READY_FRAMES_REQUIRED) {
          readyForCounting = true;
          updateStatus(`Brazo ${sideLabel} listo. Bájalo para comenzar.`, true);
        }
      } else {
        consecutiveReadyFrames = 0;
        updateStatus(`Coloca tu brazo ${sideLabel} extendido hacia abajo junto al cuerpo.`);
      }
      canvasCtx.restore();
      return;
    }

    if (angle <= DOWN_THRESHOLD) {
      wasBelowThreshold = true;
      updateStatus("Brazo abajo, prepara la elevación.", true);
    } else if (wasBelowThreshold && angle >= UP_THRESHOLD) {
      repCount += 1;
      wasBelowThreshold = false;
      updateCounterDisplay();
      updateStatus("¡Elevación completada!", true);
      playBeep();
      queueRepSync(1);
    } else if (!wasBelowThreshold && angle > DOWN_THRESHOLD && angle < UP_THRESHOLD) {
      updateStatus("Eleva hasta la línea de los hombros.");
    }
  } else {
    updateStatus("Ajusta tu posición frente a la cámara.");
    wasBelowThreshold = false;
    readyForCounting = false;
    consecutiveReadyFrames = 0;
    currentSide = null;
  }

  canvasCtx.restore();
}

function initialize() {
  if (!window.Pose || !window.Camera) {
    updateStatus("Cargando MediaPipe... intenta nuevamente.");
    return;
  }

  const pose = new window.Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(onResults);

  const camera = new window.Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  camera.start().then(
    () => {
      updateStatus("Ponte de perfil, brazos abajo y comienza cuando estés listo.");
    },
    (err) => {
      console.error("Error al iniciar cámara:", err);
      updateStatus("No pudimos acceder a la cámara.");
    }
  );
}

async function boot() {
  await checkSession();
  initialize();
}

window.addEventListener("load", boot);
