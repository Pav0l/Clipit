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
  bid?: {
    symbol: string;
    displayAmount: string;
  };
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
        <CardContent className={classes.content}>
          <div>
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
          </div>
          {props.bid ? (
            <div>
              <Typography variant="subtitle2" component="p">
                Current Bid
              </Typography>
              <Typography
                variant="subtitle2"
                component="p"
                className={`${classes.title} ${classes.glow}`}
              >
                {`${props.bid.displayAmount} ${props.bid.symbol}`}
              </Typography>
            </div>
          ) : null}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    width: "25vw",
    maxWidth: "480px"
  },
  title: {
    fontWeight: 600,
    color: "#31393C",
    fontSize: "1rem"
  },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  glow: {
    color: "#2176FF"
  }
}));
