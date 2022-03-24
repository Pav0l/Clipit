import { Box } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  children: JSX.Element | JSX.Element[];
  className?: string | undefined;
}

function CenteredContainer({ children, className }: Props) {
  const classes = useStyles();

  return <Box className={`${classes.container} ${className ?? ""}`}>{children}</Box>;
}

export default CenteredContainer;

const useStyles = makeAppStyles(() => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
  },
}));
