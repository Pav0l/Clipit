import { observer } from "mobx-react-lite";
import { useParams } from "react-router";
import { useEffect } from "react";

import ErrorWithRetry from "../../components/error/Error";
import { NftModel } from "./nft.model";
import { NftCard } from "../../components/nfts/NftCard";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { IAppController } from "../app/app.controller";
import { useWeb3 } from "../../lib/hooks/useWeb3";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: IAppController;
}

function NftContainer({ model, operations }: Props) {
  // fetch tokenId from URL
  const { tokenId } = useParams<{ tokenId?: string }>();
  if (!tokenId) {
    return <ErrorWithRetry text="Something went wrong" withRetry={true} />;
  }
  // construct ethereum and contract clients
  const { ethereum, contract, initializeWeb3 } = useWeb3(model.nft);

  useEffect(() => {
    if (!ethereum || !contract) {
      initializeWeb3();
    }
  }, []);

  useEffect(() => {
    if (!operations.nft && ethereum && contract) {
      operations.createNftCtrl(ethereum, contract);
    }
    // fetch metadata again if controller was just created (operator updated with new controller)
    if (!model.nft.metadata && operations.nft) {
      operations.nft.getTokenMetadata(tokenId);
    }
  }, [ethereum, contract]);

  if (model.nft.metadata) {
    return (
      <NftCard
        clipIpfsUri={model.nft.metadata.clipIpfsUri}
        clipTitle={model.nft.metadata.clipTitle}
        clipDescription={model.nft.metadata.description}
      />
    );
  }

  return <FullPageLoader />;
}

export default observer(NftContainer);
