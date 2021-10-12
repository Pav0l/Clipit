import {
  CardMedia,
  Card,
  CardContent,
  Typography,
  makeStyles
} from "@material-ui/core";

interface Props {
  clipIpfsUri: string;
  clipTitle: string;
  clipDescription: string;
}

/**
 * NftCard presentation component displays NFTs metadata as a card with embedded video player
 */
export function NftCard({ clipIpfsUri, clipTitle, clipDescription }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardMedia
        component="video"
        src={clipIpfsUri}
        title={`CLIP NFT video: ${clipTitle}`}
      />
      <CardContent>
        <Typography variant="subtitle1" component="h6">
          {clipTitle}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {clipDescription}
        </Typography>
      </CardContent>
    </Card>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    margin: "1rem",
    maxWidth: "85vw"
  }
}));
