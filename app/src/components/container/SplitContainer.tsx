import { Box, makeStyles } from "@material-ui/core";

interface Props {
  children: JSX.Element | JSX.Element[];
  className?: string | undefined;
}

function SplitContainer({ children, className }: Props) {
  const classes = useStyles();

  return <Box className={`${classes.container} ${className}`}>{children}</Box>;
}

export default SplitContainer;

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    minHeight: "90vh",
  },
}));
