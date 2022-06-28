import { Button } from "@material-ui/core";
import { observer } from "mobx-react-lite";

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
    <Button className={`${classes.button} ${isLoggedIn ? classes.logOut : ""}`} onClick={handleClick}>
      {isLoggedIn ? loggedInText : loggedOutText}
    </Button>
  );
}

export default observer(LoginWithTwitch);

const useStyles = makeAppStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.twitch_text_primary,
    borderRadius: "4px",
    color: theme.colors.twitch_text_secondary,
    border: "none",
    textTransform: "none",
    padding: "6px 18px",
    marginRight: "0.5rem",
    fontWeight: 500,
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_hover,
      color: theme.colors.twitch_text_secondary,
    },
  },
  logOut: {
    backgroundColor: theme.colors.twitch_bg_ternary,
    color: theme.colors.text_secondary,
    "&:hover": {
      backgroundColor: theme.colors.twitch_bg_ternary_hover,
      color: theme.colors.text_secondary,
    },
  },
}));
