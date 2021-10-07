import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Typography } from "@material-ui/core";

import "./OAuth2Redirect.css";
import {
  parseDataFromUrl,
  parseDataFromState,
  verifyStateSecret,
  storeTokenAndRemoveSecret,
  getTwitchOAuth2AuthorizeUrl
} from "../twitch-oauth.utils";
import LoginWithTwitch from "../LoginWithTwitch/LoginWithTwitch";

const OAuth2Redirect = observer(() => {
  const { access_token: token, state } = parseDataFromUrl(
    new URL(location.href)
  );

  const history = useHistory();

  if (token) {
    const { referrer, secret } = parseDataFromState(state);

    if (verifyStateSecret(secret)) {
      storeTokenAndRemoveSecret(token);
      // this wanted to be <Redirect to={referrer} /> but react router didnt play nice with mobx observer
      history.push(referrer);
      return <div>Redirecting...</div>;
    }
  }

  return (
    <Typography variant="h6" className="description">
      Something went wrong with your Twitch Login. Please try again or contact
      us.
      <br></br>
      <LoginWithTwitch redirect={getTwitchOAuth2AuthorizeUrl} />
    </Typography>
  );
});

export default OAuth2Redirect;
