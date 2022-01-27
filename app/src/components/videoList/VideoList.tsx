import { Box, makeStyles } from "@material-ui/core";

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function VideoList({ children }: Props) {
  const classes = useStyles();

  return <Box className={classes.container}>{children}</Box>;
}

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    margin: "0 1rem",
  },
}));
