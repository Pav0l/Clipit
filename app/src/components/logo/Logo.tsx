import { Typography } from "@material-ui/core";
import { RouteLink } from "../../domains/navigation/components/RouteLink";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { AppRoute } from "../../lib/constants";

interface Props {
  textClass?: string;
  linkClass?: string;

  onClick: (to: string) => void;
}

export function Logo(props: Props) {
  const classes = useStyles();

  return (
    <RouteLink
      child={
        <Typography variant="h5" className={`${classes.logo} ${props.textClass ? props.textClass : ""}`}>
          Clipit
        </Typography>
      }
      setActive={props.onClick}
      underline="none"
      to={AppRoute.HOME}
      className={props.linkClass ?? ""}
    />
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
