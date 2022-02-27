import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import FullPageLoader from "../../../components/loader/FullPageLoader";
import ErrorWithRetry from "../../../components/error/Error";
import { AppRoute } from "../../../lib/constants";
import { OAuthController } from "../oauth.controller";
import { OAuthModel } from "../oauth.model";

interface Props {
  controller: OAuthController;
  model: OAuthModel;
}

const OAuth2Redirect = observer(({ controller, model }: Props) => {
  const history = useHistory();

  useEffect(() => {
    controller.handleOAuth2Redirect(new URL(location.href));
    let referrer = model.referrer;

    if (!referrer) {
      referrer = AppRoute.HOME;
    }
    history.push(referrer);
  }, []);

  if (model.meta.error) {
    return <ErrorWithRetry text={model.meta.error.message} withRetry={false} />;
  }

  return <FullPageLoader />;
});

export default OAuth2Redirect;
