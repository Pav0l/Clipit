import { observer } from "mobx-react-lite";
import { Box } from "@material-ui/core";
import Route from "route-parser";

import { IDemoModel } from "../demo.model";
import { AppRoute, demoClip } from "../../../../lib/constants";
import Home from "../../../../components/home/Home";
import ThemeProvider from "../../../../domains/theme/components/ThemeProvider";
import ErrorWithRetry from "../../../../components/error/Error";
import Terms from "../../../../components/terms/Terms";
import { OAuthController } from "../../../../domains/twitch-oauth/oauth.controller";
import { SentryClient } from "../../../../lib/sentry/sentry.client";
import FullPageLoader from "../../../../components/loader/FullPageLoader";
import { SupportWidgetProvider } from "../../../../domains/support-widget/components/SupportWidgetProvider";
import { makeAppStyles } from "../../../../domains/theme/theme.constants";
import { NavigatorController } from "../../../../domains/navigation/navigation.controller";
import { DemoPage } from "./DemoPage";
import Snackbar from "../../../../domains/snackbar/Snackbar";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import { TelemetryService } from "../../telemetry/telemetry.service";

interface Props {
  model: IDemoModel;
  operations: {
    auth: OAuthController;
    navigator: NavigatorController;
    snackbar: SnackbarController;
  };
  sentry: SentryClient;
  telemetry: TelemetryService;
}

export const Demo = observer(function App(props: Props) {
  return (
    <SupportWidgetProvider>
      <ThemeProvider model={props.model.theme}>
        <StyledApp {...props} />
      </ThemeProvider>
    </SupportWidgetProvider>
  );
});

const StyledApp = observer(function App({ model, operations, sentry, telemetry }: Props) {
  const classes = useStyles();
  const appMetaData = model.meta;

  return (
    <Box className={classes.app}>
      <Snackbar model={{ snackbar: model.snackbar }} operations={operations.snackbar} />

      {appMetaData.isLoading ? (
        <FullPageLoader />
      ) : appMetaData.error ? (
        <ErrorWithRetry text={appMetaData.error.message} withRetry={true} classNames={classes.error} />
      ) : (
        <RouterX model={model} operations={operations} sentry={sentry} telemetry={telemetry} />
      )}
    </Box>
  );
});

const useStyles = makeAppStyles((theme) => ({
  app: {
    backgroundColor: theme.colors.background_primary,
    // TODO this should be 100vh, so that we never have content that does not fix the screen? (ToS, Errors, Loaders,...)
  },
  error: {
    height: "100vh",
  },
}));

const RouterX = observer(function RouterX({ model, operations, telemetry }: Props) {
  let app: JSX.Element | null = null;

  const home = (
    <Home
      clipId={model.clip.lastClip?.id ?? demoClip.id}
      model={model}
      telemetry={telemetry}
      operations={{ auth: operations.auth, navigator: operations.navigator }}
    />
  );

  switch (model.navigation.activeRoute) {
    case AppRoute.TERMS:
      app = <Terms logoOnClick={operations.navigator.goToRoute} />;
      break;

    case AppRoute.HOME:
      app = home;
      break;
  }

  if (app === null) {
    if (model.navigation.activeRoute?.startsWith(AppRoute.DEMO)) {
      const route = new Route<{ clipId: string }>(AppRoute.DEMO_CLIP);
      const matched = route.match(model.navigation.activeRoute);

      if (matched !== false) {
        app = (
          <DemoPage
            clipId={matched.clipId}
            withThumbnail={model.mode === "thumbnail"}
            operations={{ auth: operations.auth, navigator: operations.navigator }}
            model={model}
          />
        );
      }
    }
  }

  // app is still null -> must be some unknown route, just go home
  if (app === null) {
    app = home;
  }

  return app;
});
