/**
 * @dev - can return `NaN` if start and/or duration are undefined
 */
export function calcExpectedEndOfAuction(
  start?: string,
  duration?: string,
  expectedEnd?: string | null
) {
  const now = Math.floor(Date.now() / 1000);
  if (expectedEnd) {
    return (Number(expectedEnd) - now);
  } else {
    const end = Number(start) + Number(duration);
    return (end - now);
  }
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
