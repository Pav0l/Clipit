import { makeStyles, Toolbar, Typography } from "@material-ui/core";
import { AppRoute } from "../../lib/constants";
import { LinkButton } from "../linkButton/LinkButton";

export default function Footer() {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Toolbar className={classes.toolbar}>
        <LinkButton
          to={AppRoute.TERMS}
          setActive={() => null}
          className={classes.link}
          text={<Typography variant="caption">Terms of Service</Typography>}
          underline="hover"
        />
      </Toolbar>
    </footer>
  );
}

const useStyles = makeStyles(() => ({
  footer: {
    padding: "0 25rem",
    margin: "0 2rem",
  },
  toolbar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    margin: 0,
  },
  link: {
    margin: "0 2rem",
  },
}));
