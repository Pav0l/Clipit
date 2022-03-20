import { observer } from "mobx-react-lite";
import { useParams } from "react-router";
import { useEffect } from "react";

import ErrorWithRetry from "../../../components/error/Error";
import { NftCard } from "../../../components/nfts/NftCard";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import SplitContainer from "../../../components/container/SplitContainer";
import { NftModel } from "../nft.model";
import { NftController } from "../nft.controller";
import { Web3Model } from "../../web3/web3.model";
import { Web3Controller } from "../../web3/web3.controller";
import { NftDetails } from "../../../components/nfts/NftDetails";
import { SentryClient } from "../../../lib/sentry/sentry.client";
import { AuctionModel } from "../../auction/auction.model";
import { UiController } from "../../app/ui.controller";

interface Props {
  model: {
    nft: NftModel;
    web3: Web3Model;
    auction: AuctionModel;
  };
  operations: {
    nft: NftController;
    web3: Web3Controller;
    ui: UiController;
  };
  sentry: SentryClient;
}

function NftContainer({ model, operations, sentry }: Props) {
  const { tokenId } = useParams<{ tokenId?: string }>();
  if (!tokenId) {
    sentry.captureMessage("missing tokenId in url params");
    return <ErrorWithRetry text="Something went wrong" withRetry={true} />;
  }
  const metadata = model.nft.getTokenMetadata(tokenId);

  useEffect(() => {
    if (!metadata) {
      operations.nft.getTokenMetadata(tokenId);
    }
  }, []);

  // MetaMask not installed
  if (model.nft.meta.error) {
    return <ErrorWithRetry text={model.nft.meta.error.message} withRetry={false} />;
  }

  if (metadata) {
    return (
      <SplitContainer>
        <NftCard metadata={metadata} />
        <NftDetails
          metadata={metadata}
          tokenId={tokenId}
          operations={{ web3: operations.web3, ui: operations.ui }}
          model={model}
        />
      </SplitContainer>
    );
  }

  return <FullPageLoader />;
}

export default observer(NftContainer);
