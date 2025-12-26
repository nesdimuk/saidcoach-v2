/**
 * Calculates the elbow angle (shoulder–elbow–wrist) in degrees.
 * Returns null when any required landmark is missing or the vectors are degenerate.
 */
export function calculateElbowAngle(shoulder, elbow, wrist) {
  if (!shoulder || !elbow || !wrist) {
    return null;
  }

  const upper = {
    x: shoulder.x - elbow.x,
    y: shoulder.y - elbow.y,
  };
  const lower = {
    x: wrist.x - elbow.x,
    y: wrist.y - elbow.y,
  };

  const upperMag = Math.hypot(upper.x, upper.y);
  const lowerMag = Math.hypot(lower.x, lower.y);

  if (upperMag === 0 || lowerMag === 0) {
    return null;
  }

  const dot = upper.x * lower.x + upper.y * lower.y;
  const ratio = Math.min(Math.max(dot / (upperMag * lowerMag), -1), 1);

  return (Math.acos(ratio) * 180) / Math.PI;
}
