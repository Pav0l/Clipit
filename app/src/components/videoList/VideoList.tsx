import { Box } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  children: JSX.Element | JSX.Element[];
  dataTestId?: string;
}

export default function VideoList({ children, dataTestId }: Props) {
  const classes = useStyles();

  return (
    <Box className={classes.container} data-testid={dataTestId ?? ""}>
      {children}
    </Box>
  );
}

const useStyles = makeAppStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    margin: "auto 1rem",
  },
}));
