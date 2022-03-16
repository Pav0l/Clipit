import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@material-ui/core";
import { makeAppStyles } from "../../theme/theme.constants";

interface Props {
  title: string;
  thumbnailUrl: string;
}

export function ClipCard(props: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia component="img" alt="Clip thumbnail" image={props.thumbnailUrl} />
        <CardContent>
          <Typography variant="subtitle1" component="p" noWrap className={classes.title}>
            {props.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const useStyles = makeAppStyles((theme) => ({
  card: {
    width: "25vw",
    maxWidth: "350px",
  },
  title: {
    fontWeight: 600,
    color: theme.colors.text_secondary,
    fontSize: "1rem",
  },
}));
