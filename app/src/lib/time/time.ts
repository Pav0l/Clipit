/**
 * @dev - can return `NaN` if expectedEnd is undefined | null
 */
export function calcExpectedEndOfAuction(expectedEnd?: string | null) {
  if (!expectedEnd) {
    return NaN;
  }
  const now = Math.floor(Date.now() / 1000);
  return (Number(expectedEnd) - now);
}

export function formatTimestampToCountdown(ts: number): string | null {
  if (ts <= 0 || isNaN(ts)) {
    return null;
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
