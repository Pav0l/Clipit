import { observer } from "mobx-react-lite";
import { Box } from "@material-ui/core";

import { IDemoModel } from "../demo.model";
import { AppRoute, demoClip } from "../../../../lib/constants";
import ThemeProvider from "../../../../domains/theme/components/ThemeProvider";
import ErrorWithRetry from "../../../../components/error/Error";
import Terms from "../../../../components/terms/Terms";
import { SentryClient } from "../../../../lib/sentry/sentry.client";
import FullPageLoader from "../../../../components/loader/FullPageLoader";
import { SupportWidgetProvider } from "../../../../domains/support-widget/components/SupportWidgetProvider";
import { makeAppStyles } from "../../../../domains/theme/theme.constants";
import { NavigatorController } from "../../../../domains/navigation/navigation.controller";
import Snackbar from "../../../../domains/snackbar/Snackbar";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import { TelemetryService } from "../../telemetry/telemetry.service";
import { OAuthController } from "../../../../domains/twitch-oauth/oauth.controller";
import { DemoHome } from "./DemoHome";

interface Props {
  model: IDemoModel;
  operations: {
    navigator: NavigatorController;
    snackbar: SnackbarController;
    auth: OAuthController;
  };
  sentry: SentryClient;
  telemetry: TelemetryService;
}

export const Demo = observer(function App(props: Props) {
  return (
    <SupportWidgetProvider>
      <ThemeProvider model={props.model.theme}>
        <StyledDemo {...props} />
      </ThemeProvider>
    </SupportWidgetProvider>
  );
});

const StyledDemo = observer(function App({ model, operations, sentry, telemetry }: Props) {
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
        <DemoRouter model={model} operations={operations} sentry={sentry} telemetry={telemetry} />
      )}
    </Box>
  );
});

const useStyles = makeAppStyles((theme) => ({
  app: {
    backgroundColor: theme.colors.background_primary,
  },
  error: {
    height: "100vh",
  },
}));

const DemoRouter = observer(function DemoRouter({ model, operations, telemetry }: Props) {
  let app: JSX.Element | null = null;

  switch (model.navigation.activeRoute) {
    case AppRoute.TERMS:
      app = <Terms logoOnClick={operations.navigator.goToRoute} />;
      break;
  }

  // if (model.navigation.activeRoute?.startsWith(AppRoute.DEMO)) {
  //   app = (
  //     <DemoPage
  //       clipId={model.navigation.appRoute.params!.clipId}
  //       model={{
  //         auth: model.auth,
  //         clip: model.clip,
  //       }}
  //       operations={{
  //         auth: operations.auth,
  //         navigator: operations.navigator,
  //         snackbar: operations.snackbar,
  //       }}
  //       withThumbnail={false}
  //     />
  //   );
  // }

  if (app === null) {
    app = (
      <DemoHome
        clipId={model.clip.lastClip?.id ?? demoClip.id}
        model={model}
        operations={{
          telemetry: telemetry,
          snackbar: operations.snackbar,
        }}
      />
    );
  }

  return app;
});
