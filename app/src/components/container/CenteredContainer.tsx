import { Box, makeStyles } from "@material-ui/core";

interface Props {
  children: JSX.Element | JSX.Element[];
  className?: string | undefined;
}

function CenteredContainer({ children, className }: Props) {
  const classes = useStyles();

  return <Box className={`${classes.container} ${className}`}>{children}</Box>;
}

export default CenteredContainer;

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));
