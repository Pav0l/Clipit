import "./ClipCard.css";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
// import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

export function ClipCard(props: ClipCardProps) {
  return (
    <Card className="clip-card">
      <CardActionArea>
        <CardMedia
          component="img"
          alt={props.title}
          image={props.thumbnailUrl}
          title={props.title}
        />
        <CardContent className="clip-text">
          <Typography variant="subtitle1" component="h6" className="clip-title">
            {props.title}
          </Typography>
          {/* <Typography variant="body2" color="textSecondary" component="p">
            {props.broadcasterName} playing {props.gameId}
          </Typography> */}
          <Typography variant="body2" color="textSecondary" component="p">
            {props.viewCount} views
          </Typography>
          {/* <Button size="small" color="primary">
            Mint
          </Button> */}
        </CardContent>
      </CardActionArea>
      {/* <CardActions>
        <Button size="small" color="primary">
          Mint
        </Button>
      </CardActions> */}
    </Card>
  );
}

interface ClipCardProps {
  title: string;
  thumbnailUrl: string;
  broadcasterName: string;
  gameId: string;
  viewCount: number;
}
