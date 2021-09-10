import { BigNumber } from "ethers";
import { useEffect } from "react";
import { getTokenIdsFromEvents } from "../lib/contract/contract.utils";
import { NftStore } from "../store/nft.store";

export function useAddressClips(nftStore: NftStore) {
  const fetchUsersClips = async () => {
    nftStore.meta.setLoading(true);

    // if (typeof (window as any).ethereum !== "undefined") {
    //   await requestAccount();

    //   const currentWalletAddress = await signer.getAddress();

    //   const events = await contractClient.getWalletsClipNFTs(
    //     currentWalletAddress
    //   );

    //   const tokenIds: BigNumber[] = getTokenIdsFromEvents(events as any); // TODO FIX ANY

    //   const cidList = [];

    //   for (const token of tokenIds) {
    //     const uri = await contractClient.getMetadataTokenUri(token.toString());
    //     const metadataCid = uri.replace("ipfs://", "").split("/")[0];
    //     cidList.push({ cid: metadataCid, tokenId: token });
    //   }

    //   // nftStore.appendMultipleClips(cidList); TODO
    // } else {
    //   console.log("MISSING window.ethereum OBJECT");
    // }
    nftStore.meta.setLoading(false);
  };

  useEffect(() => {
    fetchUsersClips();

    return () => {
      nftStore.meta.setLoading(false);
    };
  }, []);
}
