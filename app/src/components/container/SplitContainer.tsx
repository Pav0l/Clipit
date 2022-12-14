import { Box } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  children: JSX.Element | JSX.Element[];
  className?: string | undefined;
  dataTestId?: string | undefined;
}

function SplitContainer({ children, className, dataTestId }: Props) {
  const classes = useStyles();

  return (
    <Box className={`${classes.container} ${className ?? ""}`} data-testid={dataTestId ?? ""}>
      {children}
    </Box>
  );
}

export default SplitContainer;

const useStyles = makeAppStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
}));
