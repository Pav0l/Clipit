import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { NftStore } from "./nft.store";
import { NftCard } from "../../components/nfts/NftCard";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { AppController } from "../app/app.controller";
import { useWeb3 } from "../app/useWeb3";
import { Link } from "react-router-dom";
import { AppRoute } from "../../lib/constants";

interface Props {
  model: {
    nft: NftStore;
  };
  operations: AppController;
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
      operations.nft.fetchTokenMetadataForAddress();
    }
  }, [ethereum, contract]);

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
    // TODO box -> flexbox + css
    <div>
      {tokenIds.map((tokenId, idx) => (
        <NftCard
          key={idx}
          clipIpfsUri={model.nft.metadataCollection[tokenId].clipIpfsUri}
          clipTitle={model.nft.metadataCollection[tokenId].clipTitle}
          clipDescription={model.nft.metadataCollection[tokenId].description}
        />
      ))}
    </div>
  );
}

export default observer(NftsContainer);
