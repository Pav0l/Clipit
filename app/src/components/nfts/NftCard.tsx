import CardMedia from "@material-ui/core/CardMedia";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

interface Props {
  clipIpfsUri: string;
  clipTitle: string;
  clipDescription: string;
}

/**
 * NftCard presentation component displays NFTs metadata as a card with embedded video player
 */
export function NftCard({ clipIpfsUri, clipTitle, clipDescription }: Props) {
  return (
    <Card>
      <CardMedia component="iframe" src={clipIpfsUri} title={clipTitle} />
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
