import { makeStyles, Card, CardActionArea, CardMedia } from "@material-ui/core";
import { Metadata } from "../../domains/nfts/nft.model";
import { NftCardContent } from "./NftCardContent";

interface Props {
  metadata: Metadata;
}

export function CardWithThumbnail({ metadata }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Card with thumbnail"
          src={metadata.thumbnailUri}
        />
        <NftCardContent
          title={metadata.clipTitle}
          description={metadata.description}
          auction={metadata.auction}
          bid={metadata.currentBid}
        />
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    width: "25vw",
    maxWidth: "480px"
  }
}));
