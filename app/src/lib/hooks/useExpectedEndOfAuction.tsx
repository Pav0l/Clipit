import { useState, useEffect } from "react";
import {
  calcExpectedEndOfAuction,
  formatTimestampToCountdown
} from "../time/time";

export function useExpectedEndOfAuction(
  auction: {
    duration?: string;
    firstBidTime?: string;
    expectedEndTimestamp?: string | null;
  } | null
) {
  const [endOfAuction, setEnd] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => {
      setEnd(
        calcExpectedEndOfAuction(
          auction?.firstBidTime,
          auction?.duration,
          auction?.expectedEndTimestamp
        )
      );
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return [formatTimestampToCountdown(endOfAuction)];
}
