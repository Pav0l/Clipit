import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Route, RouteProps } from "react-router-dom";
import { OAuthController } from "../oauth.controller";
import { OAuthModel } from "../oauth.model";

interface Props extends RouteProps {
  model: {
    auth: OAuthModel;
  };
  operations: {
    auth: OAuthController;
  };
}

function OAuthProtectedRoute(props: Props) {
  useEffect(() => {
    if (!props.model.auth.isLoggedIn) {
      location.assign(props.operations.auth.getTwitchOAuth2AuthorizeUrl());
    }
  }, []);

  return <Route {...props} />;
}

export default observer(OAuthProtectedRoute);
