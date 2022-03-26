import { Button } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { makeAppStyles } from "../../theme/theme.constants";
import { OAuthController } from "../oauth.controller";
import { OAuthModel } from "../oauth.model";

interface Props {
  model: {
    auth: OAuthModel;
  };
  operations: OAuthController;
}

function LoginWithTwitch({ model, operations }: Props) {
  const classes = useStyles();
  const isLoggedIn = model.auth.isLoggedIn;

  return (
    <Button
      className={`${classes.button} ${isLoggedIn ? classes.logOut : ""}`}
      onClick={isLoggedIn ? operations.logout : operations.initOauthFlowIfNotAuthorized}
    >
      {isLoggedIn ? "Log out" : "Login with Twitch"}
    </Button>
  );
}

export default observer(LoginWithTwitch);

const useStyles = makeAppStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.twitch_bg_primary,
    borderRadius: "4px",
    color: theme.colors.twitch_text_primary,
    border: "none",
    textTransform: "none",
    padding: "6px 18px",
    marginRight: "0.5rem",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_hover,
      color: theme.colors.twitch_text_primary,
    },
  },
  logOut: {
    backgroundColor: theme.colors.twitch_bg_secondary,
    color: theme.colors.twitch_text_secondary,
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_secondary_hover,
      color: theme.colors.twitch_text_secondary,
    },
  },
}));
