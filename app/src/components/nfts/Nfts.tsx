import { observer } from "mobx-react-lite";
// import { Box, CircularProgress } from "@material-ui/core";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { useStore } from "../../store/StoreProvider";
import { useHistory, useParams } from "react-router";
import { useEffect } from "react";
import { NftService } from "../../domains/nfts/nft.service";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { isComputed, isObservable } from "mobx";

// TODO refactor
function Nfts() {
  const { nftStore } = useStore();
  const nftService = new NftService(nftStore);

  useEffect(() => {
    nftService.getAddressClips();
  }, []);

  if (!nftStore.metadataCollection) {
    return <div>loading</div>;
  }

  if (Object.keys(nftStore.metadataCollection).length === 0) {
    return <div>no metadata</div>;
  }

  return (
    <div>
      {Object.keys(nftStore.metadataCollection).map((metadata, idx) => (
        <div key={idx}>
          {nftStore.metadataCollection![metadata].description}
        </div>
      ))}
    </div>
  );

  // const ec = nftService.initializeEthereumClient(
  //   window.ethereum as EthereumProvider
  // );
  // if (!ec) {
  //   return <div>no ec</div>;
  // }
  // const cc = nftService.initializeContractClient(ec?.signer);

  // return (
  //   <Card>
  //     <CardActionArea>
  //       <CardMedia
  //         component="iframe"
  //         src={nftIpfsUri}
  //         title={nftStore.metadata?.name}
  //       />
  //       <CardContent className="clip-detail-text">
  //         <Typography variant="subtitle1" component="h6" className="clip-title">
  //           {nftStore.metadata?.name}
  //         </Typography>
  //         <Typography variant="body2" color="textSecondary" component="p">
  //           {nftStore.metadata?.attributes![0].value} playing{" "}
  //           {nftStore.metadata?.attributes![1].value}
  //         </Typography>
  //       </CardContent>
  //     </CardActionArea>
  //   </Card>
  // );

  // <nft-card
  //   contractAddress="0x6ea040ee61c7afc835b860923f08827bc98114d7"
  //   tokenId="93328660433984226977111889471957288723085335888891915731507605523347401729722"
  //   network="rinkeby"
  // ></nft-card>

  // if (nftStore.meta.isLoading) {
  //   return (
  //     <Box className="clips-container with-center-content">
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  // if (nftStore.nfts.length > 0) {
  //   return (
  //     <Box className="clips-container">
  //       {nftStore.nfts.map((clip) => {
  //         // return <ClipCard cid={clip.cid} key={clip.cid} />;
  //         return <div>{JSON.stringify(clip)}</div>;
  //       })}
  //     </Box>
  //   );
  // }

  // if (nftStore.nfts.length === 0) {
  //   return (
  //     <Box className="clips-container with-center-content">
  //       <div>There are no CLIPs in your wallet</div>
  //     </Box>
  //   );
  // }

  // return (
  //   <Box className="clips-container with-center-content">
  //     <CircularProgress />
  //   </Box>
  // );
}

export default observer(Nfts);
