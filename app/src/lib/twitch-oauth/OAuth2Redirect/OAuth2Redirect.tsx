import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import FullPageLoader from "../../../components/loader/FullPageLoader";
import { AppRoute } from "../../constants";
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

  return <FullPageLoader />;
});

export default OAuth2Redirect;
