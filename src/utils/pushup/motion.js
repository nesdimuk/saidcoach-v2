const START_ANGLE_DROP = 3; // degrees
const START_CHEST_DELTA = 0.0005; // normalized 0-1 space
const MIN_DEPTH_RATIO = 0.03;
const MIN_DEPTH_FOR_END = 0.03;
const MIN_ECC_TIME = 1.0; // seconds
const MAX_ECC_TIME = 5.0;
const MIN_TIME_THRESHOLD = 0.9;
const MAX_SPEED = 0.07;
const HIP_MAX_LEAD = 0.07;
const STALL_THRESHOLD = 0.0004;
const STALL_FRAMES_LIMIT = 6;

function getTorsoLength(frame) {
  const leftShoulder = frame.leftShoulder;
  const leftHip = frame.leftHip;
  const rightShoulder = frame.rightShoulder;
  const rightHip = frame.rightHip;

  if (leftShoulder && leftHip) {
    const dx = (leftShoulder.x ?? 0) - (leftHip.x ?? 0);
    const dy = (leftShoulder.y ?? 0) - (leftHip.y ?? 0);
    return Math.hypot(dx, dy);
  }

  if (rightShoulder && rightHip) {
    const dx = (rightShoulder.x ?? 0) - (rightHip.x ?? 0);
    const dy = (rightShoulder.y ?? 0) - (rightHip.y ?? 0);
    return Math.hypot(dx, dy);
  }

  if (typeof frame.chestY === "number" && typeof frame.hipY === "number") {
    return Math.abs(frame.hipY - frame.chestY);
  }

  return null;
}

export function computeChestY(landmarks = []) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  if (leftShoulder && rightShoulder) {
    return (leftShoulder.y + rightShoulder.y) / 2;
  }
  return (leftShoulder ?? rightShoulder)?.y ?? null;
}

export function computeHipY(landmarks = []) {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  if (leftHip && rightHip) {
    return (leftHip.y + rightHip.y) / 2;
  }
  return (leftHip ?? rightHip)?.y ?? null;
}

export function detectStartEccentric(state, frame) {
  if (state.phase !== "idle") return false;
  if (state.prevAngle == null || frame.elbowAngle == null || state.prevChestY == null) {
    state.prevAngle = frame.elbowAngle;
    state.prevChestY = frame.chestY;
    return false;
  }

  const torsoLength = getTorsoLength(frame);
  if (!torsoLength || torsoLength < 0.05) {
    state.prevAngle = frame.elbowAngle;
    state.prevChestY = frame.chestY;
    return false;
  }

  if (state.baselineChestY == null) {
    state.baselineChestY = frame.chestY;
  } else if (frame.chestY < state.baselineChestY) {
    state.baselineChestY = frame.chestY;
  }

  const angleDrop = state.prevAngle - frame.elbowAngle;
  const referenceChest = state.baselineChestY ?? state.prevChestY ?? frame.chestY;
  const rawChestDelta = frame.chestY - referenceChest;
  const normalizedChestDelta = rawChestDelta > 0 ? rawChestDelta / torsoLength : 0;

  const armCocked = angleDrop >= START_ANGLE_DROP;
  const chestMoving = normalizedChestDelta >= START_CHEST_DELTA;

  if (armCocked && chestMoving) {
    state.phase = "descending";
    state.startTime = frame.timestamp;
    state.startChestY = referenceChest;
    state.startHipY = frame.hipY;
    state.torsoLength = torsoLength;
    state.depth = 0;
    state.totalDepth = 0;
    state.prevDepth = 0;
    state.stallFrames = 0;
    state.maxHipLead = 0;
    state.prevAngle = frame.elbowAngle;
    state.prevChestY = frame.chestY;
    return true;
  }

  state.prevAngle = frame.elbowAngle;
  state.prevChestY = frame.chestY;
  return false;
}

export function detectEndEccentric(state, frame) {
  if (state.phase !== "descending") return false;

  const torsoLength = state.torsoLength ?? getTorsoLength(frame);
  if (!torsoLength || torsoLength < 0.05) {
    return false;
  }

  const rawDepth = frame.chestY - (state.prevChestY ?? frame.chestY);
  const depthIncrement = rawDepth > 0 ? rawDepth / torsoLength : 0;
  state.depth = Math.max(0, (state.depth ?? 0) + depthIncrement);
  const normalizedDepth = Math.max(0, (frame.chestY - state.startChestY) / torsoLength);
  state.totalDepth = normalizedDepth;

  const depth = normalizedDepth;
  const hipLead = frame.hipY - frame.chestY;
  state.depth = Math.max(0, depth);
  state.maxHipLead = Math.max(state.maxHipLead ?? hipLead, hipLead);

  const depthDelta = depth - (state.prevDepth ?? 0);
  if (depthDelta <= STALL_THRESHOLD) {
    state.stallFrames = (state.stallFrames ?? 0) + 1;
  } else {
    state.stallFrames = 0;
  }
  state.prevDepth = depth;

  const angleDrop = state.prevAngle - frame.elbowAngle;
  const chestDelta = frame.chestY - state.prevChestY;
  const duration = (frame.timestamp - state.startTime) / 1000;

  const depthReached = depth >= MIN_DEPTH_FOR_END;
  const chestStalled = chestDelta <= 0.0005;
  const angleStalled = angleDrop <= 0;
  const stalledFrames = state.stallFrames >= STALL_FRAMES_LIMIT;
  const timedOut = duration >= MAX_ECC_TIME;

  state.currentDuration = duration;
  state.currentSpeed = duration > 0 ? Math.abs(depth / duration) : 0;

  state.prevAngle = frame.elbowAngle;
  state.prevChestY = frame.chestY;

  if (depthReached || chestStalled || angleStalled || stalledFrames || timedOut) {
    state.phase = "evaluating";
    state.endTime = frame.timestamp;
    state.endChestY = frame.chestY;
    state.endHipY = frame.hipY;
    return true;
  }
  return false;
}

export function validateEccentricRep(state) {
  const duration = (state.endTime - state.startTime) / 1000;
  const depth =
    state.totalDepth ??
    state.depth ??
    (state.torsoLength && state.torsoLength > 0
      ? Math.max(0, state.endChestY - state.startChestY) / state.torsoLength
      : Math.max(0, state.endChestY - state.startChestY));
  const speed = duration > 0 ? depth / duration : Infinity;
  const hipGap = state.maxHipLead ?? 0;

  if (duration < MIN_TIME_THRESHOLD) {
    return { valid: false, reason: "too_fast", metrics: { duration, depth, speed } };
  }

  if (duration < MIN_ECC_TIME) {
    return { valid: false, reason: "too_short", metrics: { duration, depth, speed } };
  }

  if (duration > MAX_ECC_TIME) {
    return { valid: false, reason: "too_long", metrics: { duration, depth, speed } };
  }

  if (depth < MIN_DEPTH_RATIO) {
    return { valid: false, reason: "too_shallow", metrics: { duration, depth, speed } };
  }

  if (speed > MAX_SPEED) {
    return { valid: false, reason: "too_fast", metrics: { duration, depth, speed } };
  }

  if (hipGap > HIP_MAX_LEAD) {
    return { valid: false, reason: "hip_collapse", metrics: { duration, depth, speed } };
  }

  return { valid: true, reason: "valid", metrics: { duration, depth, speed } };
}
