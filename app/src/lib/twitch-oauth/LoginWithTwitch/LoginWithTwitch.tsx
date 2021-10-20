import { Button, makeStyles } from "@material-ui/core";
import { OAuthController } from "../oauth.controller";
import { OAuthModel } from "../oauth.model";

interface Props {
  model: {
    auth: OAuthModel;
  };
  operations: OAuthController;
  redirect: () => string;
}

function LoginWithTwitch({ model, operations, redirect }: Props) {
  const classes = useStyles();
  const isLoggedIn = model.auth.isLoggedIn;

  return (
    <Button
      className={`${classes.button} ${isLoggedIn ? classes.logOut : ""}`}
      onClick={
        isLoggedIn ? operations.logout : () => (location.href = redirect())
      }
    >
      {isLoggedIn ? "Log out" : "Login with Twitch"}
    </Button>
  );
}

export default LoginWithTwitch;

const useStyles = makeStyles(() => ({
  button: {
    backgroundColor: "#9147ff",
    borderRadius: "4px",
    color: "#fff",
    border: "none",
    textTransform: "none",
    padding: "6px 18px",
    marginRight: "0.5rem",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#772ce8",
      color: "#fff"
    }
  },
  logOut: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    color: "#000",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      color: "#000"
    }
  }
}));
