import {
  makeStyles,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography
} from "@material-ui/core";

interface Props {
  title: string;
  description: string;
  thumbnailUrl: string;
}

export function CardWithThumbnail(props: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Card with thumbnail"
          src={props.thumbnailUrl}
        />
        <CardContent>
          <Typography
            variant="subtitle1"
            component="h6"
            noWrap
            className={classes.title}
          >
            {props.title}
          </Typography>
          <Typography
            variant="subtitle2"
            component="p"
            color="textSecondary"
            noWrap
          >
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    width: "25vw",
    maxWidth: "350px"
  },
  title: {
    fontWeight: 600,
    color: "#31393C",
    fontSize: "1rem"
  }
}));
