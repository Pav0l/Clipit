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
        child={
          <Typography variant="caption" className={classes.link}>
            Terms & conditions
          </Typography>
        }
        underline="hover"
        className={classes.link}
      />
    </footer>
  );
}

const useStyles = makeAppStyles((theme) => ({
  footer: {
    display: "flex",
    justifyContent: "end",
    padding: "5px 0",
  },
  link: {
    color: theme.colors.text_secondary,
  },
}));
