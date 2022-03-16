import { Card, CardActionArea, CardMedia } from "@material-ui/core";
import { Metadata } from "../../domains/nfts/nft.model";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { NftCardContent } from "./NftCardContent";

interface Props {
  metadata: Metadata;
}

export function CardWithThumbnail({ metadata }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia component="img" alt="Card with thumbnail" src={metadata.thumbnailUri} />
        <NftCardContent title={metadata.clipTitle} description={metadata.description} auction={metadata.auction} />
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeAppStyles(() => ({
  card: {
    width: "25vw",
    maxWidth: "480px",
  },
}));
