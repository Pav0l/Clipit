import { Typography } from "@material-ui/core";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { AppRoute } from "../../lib/constants";
import { LinkButton } from "../linkButton/LinkButton";

export default function Footer() {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <LinkButton
        to={AppRoute.TERMS}
        setActive={() => null}
        className={classes.link}
        text={<Typography variant="caption">Terms of Service</Typography>}
        underline="hover"
      />
    </footer>
  );
}

const useStyles = makeAppStyles(() => ({
  footer: {
    margin: "auto 2rem 1rem",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: "1rem",
  },
  link: {
    margin: "0 2rem",
  },
}));
