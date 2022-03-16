import { Box } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  children: JSX.Element | JSX.Element[];
  className?: string | undefined;
}

function SplitContainer({ children, className }: Props) {
  const classes = useStyles();

  return <Box className={`${classes.container} ${className}`}>{children}</Box>;
}

export default SplitContainer;

const useStyles = makeAppStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    minHeight: "90vh",
  },
}));
