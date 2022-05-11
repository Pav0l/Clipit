import { observer } from "mobx-react-lite";
import { Box } from "@material-ui/core";

import { AppModel } from "../app.model";
import ThemeProvider from "../../domains/theme/components/ThemeProvider";
import ErrorWithRetry from "../../components/error/Error";
import FullPageLoader from "../../components/loader/FullPageLoader";
import { SupportWidgetProvider } from "../../domains/support-widget/components/SupportWidgetProvider";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import Snackbar from "../../domains/snackbar/Snackbar";
import { AppRouter } from "./AppRouter";
import { AppOperations } from "../../init";
import { SentryClient } from "../../lib/sentry/sentry.client";

interface Props {
  model: AppModel;
  operations: AppOperations;
  sentry: SentryClient;
}

export const App = observer(function App(props: Props) {
  return (
    <SupportWidgetProvider>
      <ThemeProvider model={props.model.theme}>
        <StyledApp {...props} />
      </ThemeProvider>
    </SupportWidgetProvider>
  );
});

const StyledApp = observer(function App({ model, operations, sentry }: Props) {
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
        <AppRouter model={model} operations={operations} sentry={sentry} />
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
