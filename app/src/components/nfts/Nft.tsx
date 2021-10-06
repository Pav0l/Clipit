import { observer } from "mobx-react-lite";
// import { Box, CircularProgress } from "@material-ui/core";
import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { useStore } from "../../store/StoreProvider";

// TODO refactor - pass data via props
function Nft() {
  const { nftStore } = useStore();

  if (!nftStore.metadata) {
    return <div>no metadata for token</div>;
  }
  const nftIpfsUri = `https://ipfs.io/ipfs/${nftStore.metadata?.clipCid}`;

  return (
    <Card>
      <CardActionArea>
        <CardMedia
          component="iframe"
          src={nftIpfsUri}
          title={nftStore.metadata?.name}
        />
        <CardContent className="clip-detail-text">
          <Typography variant="subtitle1" component="h6" className="clip-title">
            {nftStore.metadata?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {nftStore.metadata?.attributes![0].value} playing{" "}
            {nftStore.metadata?.attributes![1].value}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  // <nft-card
  //   contractAddress="0x6ea040ee61c7afc835b860923f08827bc98114d7"
  //   tokenId="93328660433984226977111889471957288723085335888891915731507605523347401729722"
  //   network="rinkeby"
  // ></nft-card>
}

export default observer(Nft);
