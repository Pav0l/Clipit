import { Typography } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";

interface Props {
  className?: string;
}

export function Logo(props: Props) {
  const classes = useStyles();

  return (
    <Typography variant="h5" className={`${classes.logo} ${props.className ? props.className : ""}`}>
      Clipit
    </Typography>
  );
}

const useStyles = makeAppStyles((theme) => ({
  logo: {
    backgroundColor: theme.colors.background_secondary,
    color: theme.colors.text_ternary,
    fontStyle: "italic",
    fontWeight: 900,
    padding: "2rem 3rem",
    display: "inline-block",
    textAlign: "center",
    clipPath: "polygon(0% 0%,100% 0%,100% 82%,82% 100%,0% 100%)",
  },
}));
