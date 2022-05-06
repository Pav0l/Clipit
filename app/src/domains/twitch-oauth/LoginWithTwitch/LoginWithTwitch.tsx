import { Button } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import TwitchGlitchPurpleIcon from "../../../assets/TwitchGlitchPurple.svg";

import { makeAppStyles } from "../../theme/theme.constants";
import { OAuthModel } from "../oauth.model";

interface Props {
  model: {
    auth: OAuthModel;
  };

  loggedInClick: () => void;
  loggedOutClick: () => void;

  loggedInText: string;
  loggedOutText: string;
}

function LoginWithTwitch({ model, loggedInClick, loggedOutClick, loggedInText, loggedOutText }: Props) {
  const classes = useStyles();
  const isLoggedIn = model.auth.isLoggedIn;

  const handleClick = () => {
    if (isLoggedIn) {
      loggedInClick();
    } else {
      loggedOutClick();
    }
  };

  return (
    <Button
      className={`${classes.button}`} // ${isLoggedIn ? classes.logOut : ""}
      onClick={handleClick}
      startIcon={<TwitchGlitchPurpleIcon />}
    >
      {isLoggedIn ? loggedInText : loggedOutText}
    </Button>
  );
}

export default observer(LoginWithTwitch);

const useStyles = makeAppStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.twitch_bg_primary,
    color: theme.colors.twitch_text_primary,
    borderRadius: "16px",
    border: "none",
    fontVariant: "small-caps",
    padding: "1em 2em",
    fontWeight: 900,
    fontSize: "clamp(1rem, 1.3vw, 3rem)",
    boxShadow: "0px 16px 48px #C3C8C9",
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_secondary,
      color: theme.colors.twitch_text_secondary,
    },
  },
  logOut: {
    backgroundColor: theme.colors.twitch_bg_ternary,
    color: theme.colors.text_primary,
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_ternary_hover,
      color: theme.colors.twitch_text_primary,
    },
  },
}));
