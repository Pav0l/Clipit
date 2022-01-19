
export function formatTimestampToCountdown(ts: number): string {
  if (ts <= 0) {
    return "ENDED";
  }
  const d = Math.floor(ts / (24 * 60 * 60));
  const h = Math.floor(ts / (60 * 60)) % 24;
  const m = Math.floor(ts / (60)) % 60;
  const s = Math.floor(ts) % 60;
  return `${d}d ${padZero(h)}h ${padZero(m)}m ${padZero(s)}s`;

}

function padZero(val: number) {
  return val < 10 ? "0" + val : val;
}
