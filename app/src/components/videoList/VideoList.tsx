import { Box } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  children: JSX.Element | JSX.Element[];
}

export default function VideoList({ children }: Props) {
  const classes = useStyles();

  return <Box className={classes.container}>{children}</Box>;
}

const useStyles = makeAppStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    margin: "0 1rem",
  },
}));
