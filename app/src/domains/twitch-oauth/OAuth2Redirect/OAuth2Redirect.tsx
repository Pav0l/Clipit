import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import FullPageLoader from "../../../components/loader/FullPageLoader";
import ErrorWithRetry from "../../../components/error/Error";
import { AppRoute } from "../../../lib/constants";
import { OAuthController } from "../oauth.controller";
import { OAuthModel } from "../oauth.model";
import { NavigatorController } from "../../navigation/navigation.controller";

interface Props {
  operations: {
    oauth: OAuthController;
    navigator: NavigatorController;
  };
  model: OAuthModel;
}

const OAuth2Redirect = observer(({ operations, model }: Props) => {
  useEffect(() => {
    operations.oauth.handleOAuth2Redirect(new URL(window.location.href));
    let referrer = model.referrer;

    if (!referrer) {
      referrer = AppRoute.HOME;
    }
    operations.navigator.goToRoute(referrer);
  }, []);

  if (model.meta.error) {
    return <ErrorWithRetry text={model.meta.error.message} withRetry={false} />;
  }

  return <FullPageLoader />;
});

export default OAuth2Redirect;
