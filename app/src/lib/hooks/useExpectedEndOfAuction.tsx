import { useState, useEffect } from "react";
import { formatTimestampToCountdown } from "../time/time";

export function useExpectedEndOfAuction(
  auction: {
    duration?: string;
    approvedTimestamp?: string;
    expectedEndTimestamp?: string | null;
  } | null
) {
  const [endOfAuction, setEnd] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => {
      calcExpectedEndOfAuction(
        auction?.approvedTimestamp,
        auction?.duration,
        auction?.expectedEndTimestamp
      );
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  function calcExpectedEndOfAuction(
    start?: string,
    duration?: string,
    expectedEnd?: string | null
  ) {
    const now = Math.floor(Date.now() / 1000);
    if (expectedEnd) {
      setEnd(Number(expectedEnd) - now);
    } else {
      const end = Number(start) + Number(duration);
      setEnd(end - now);
    }
  }

  return [formatTimestampToCountdown(endOfAuction)];
}
