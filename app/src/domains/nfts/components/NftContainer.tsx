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
    // SENTRY
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
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={false} />;
  }

  if (metadata) {
    return (
      <SplitContainer>
        <NftCard metadata={metadata} />
        <NftDetails
          metadata={metadata}
          tokenId={tokenId}
          operations={operations}
          model={model}
        />
      </SplitContainer>
    );
  }

  return <FullPageLoader />;
}

export default observer(NftContainer);
