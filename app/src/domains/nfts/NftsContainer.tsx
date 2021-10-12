import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { NftModel } from "./nft.model";
import { NftCard } from "../../components/nfts/NftCard";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { IAppController } from "../app/app.controller";
import { useWeb3 } from "../../lib/hooks/useWeb3";
import { Link } from "react-router-dom";
import { AppRoute } from "../../lib/constants";
import ErrorWithRetry from "../../components/error/Error";
import VideoList from "../../components/videoList/VideoList";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: IAppController;
}

function NftsContainer({ model, operations }: Props) {
  // construct ethereum and contract clients
  const { ethereum, contract, initializeWeb3 } = useWeb3(model.nft);
  const tokenIds = Object.keys(model.nft.metadataCollection);

  useEffect(() => {
    if (!ethereum || !contract) {
      initializeWeb3();
    }
  }, []);

  useEffect(() => {
    if (!operations.nft && ethereum && contract) {
      operations.createNftCtrl(ethereum, contract);
    }
    // fetch current address token ids and its metadata
    if (tokenIds.length === 0 && operations.nft) {
      operations.nft.getCurrentSignerTokensMetadata();
    }
  }, [ethereum, contract]);

  // MetaMask not installed
  if (model.nft.meta.hasError) {
    // TODO add onboarding and retry handler button to error msg
    return <ErrorWithRetry text={model.nft.meta.error} withRetry={false} />;
  }

  if (model.nft.meta.isLoading) {
    return <FullPageLoader />;
  }

  if (tokenIds.length === 0) {
    return (
      <div>
        It seems you have no NFTs yet. Try{" "}
        <Link to={AppRoute.CLIPS}>minting your first clip</Link>.
      </div>
    );
  }

  return (
    <VideoList>
      {tokenIds.map((tokenId, idx) => (
        <NftCard
          key={idx}
          clipIpfsUri={model.nft.metadataCollection[tokenId].clipIpfsUri}
          clipTitle={model.nft.metadataCollection[tokenId].clipTitle}
          clipDescription={model.nft.metadataCollection[tokenId].description}
        />
      ))}
    </VideoList>
  );
}

export default observer(NftsContainer);
