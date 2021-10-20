import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";

import ErrorWithRetry from "../../../components/error/Error";
import { OAuthController } from "../oauth.controller";

interface Props {
  operations: OAuthController;
}

const OAuth2Redirect = observer(({ operations }: Props) => {
  const { access_token: token, state } = operations.parseDataFromUrl(
    new URL(location.href)
  );

  const history = useHistory();

  if (token) {
    const { referrer, secret } = operations.parseDataFromState(state);

    if (operations.verifyStateSecret(secret)) {
      operations.storeTokenAndRemoveSecret(token);
      // this wanted to be <Redirect to={referrer} /> but react router didnt play nice with mobx observer
      history.push(referrer);
      return <div>Redirecting...</div>;
    }
  }

  return (
    <ErrorWithRetry
      text="Something went wrong with your Twitch Login."
      withRetry={true}
    />
  );
});

export default OAuth2Redirect;
