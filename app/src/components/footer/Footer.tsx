import { Typography } from "@material-ui/core";
import { RouteLink } from "../../domains/navigation/components/RouteLink";
import { NavigatorController } from "../../domains/navigation/navigation.controller";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { AppRoute } from "../../lib/constants";

interface Props {
  operations: {
    navigator: NavigatorController;
  };
}

export default function Footer({ operations }: Props) {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <RouteLink
        to={AppRoute.TERMS}
        setActive={operations.navigator.goToRoute}
        className={classes.link}
        child={<Typography variant="caption">Terms of Service</Typography>}
        underline="hover"
      />
    </footer>
  );
}

const useStyles = makeAppStyles(() => ({
  footer: {
    margin: "1rem 2rem",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: "1rem",
  },
  link: {
    margin: "0 2rem",
    cursor: "pointer",
  },
}));
