import { useState, useEffect } from "react";
import { Auction, DisplayAuctionStatus, DisplayAuctionStatusTitle } from "../../domains/nfts/nft.model";

export function useAuctionStatus(auction: Auction | null) {
  const [status, setStatus] = useState<DisplayAuctionStatus>({
    title: DisplayAuctionStatusTitle.EMPTY,
    value: "",
  } as DisplayAuctionStatus);

  useEffect(() => {
    if (!auction) {
      return;
    }

    setStatus(auction.displayAuctionStatus);
    const id = setInterval(() => {
      setStatus(auction.displayAuctionStatus);
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return [status];
}
