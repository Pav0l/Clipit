import { observer } from "mobx-react-lite";
import { useParams } from "react-router";
import { useEffect } from "react";

import ErrorWithRetry from "../../../components/error/Error";
import { NftCard } from "../../../components/nfts/NftCard";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import SplitContainer from "../../../components/container/SplitContainer";
import { NftModel } from "../nft.model";
import { NftController } from "../nft.controller";
import { BidForm } from "../../../components/bidForm/BidForm";
import { Web3Model } from "../../web3/web3.model";
import { Web3Controller } from "../../web3/web3.controller";

interface Props {
  model: {
    nft: NftModel;
    web3: Web3Model;
  };
  operations: {
    nft: NftController;
    web3: Web3Controller;
  };
}

function NftContainer({ model, operations }: Props) {
  const { tokenId } = useParams<{ tokenId?: string }>();
  if (!tokenId) {
    // TODO SENTRY + how is this handled?
    return <ErrorWithRetry text="Something went wrong" withRetry={true} />;
  }
  const metadata = model.nft.getTokenMetadata(tokenId);

  useEffect(() => {
    if (!metadata) {
      operations.nft.getTokenMetadata(tokenId);
    }
  }, []);

  // MetaMask not installed
  if (model.nft.meta.hasError) {
    // TODO add onboarding and retry handler button to error msg
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={false} />;
  }

  if (metadata) {
    const minBid =
      metadata.currentBids.length > 0
        ? Number(metadata.currentBids[0].displayAmount) * 1.05
        : "0";

    const isNftOwn = metadata.owner === model.web3.getAccount();

    return (
      <SplitContainer>
        <NftCard
          clipIpfsUri={metadata.clipIpfsUri}
          clipTitle={metadata.clipTitle}
          clipDescription={metadata.description}
          poster={metadata.thumbnailUri}
        />
        {isNftOwn ? (
          <BidForm
            minimalBid={minBid.toString()}
            operations={{ web3: operations.web3 }}
            model={{ web3: model.web3 }}
          />
        ) : (
          <></>
        )}
      </SplitContainer>
    );
  }

  return <FullPageLoader />;
}

export default observer(NftContainer);
