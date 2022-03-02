import { observer } from "mobx-react-lite";

import ThemeProvider from "../../../../components/themeProvider/ThemeProvider";
import { defaultTheme } from "../../../../components/themeProvider/theme";
import ErrorWithRetry from "../../../../components/error/Error";
import FullPageLoader from "../../../../components/loader/FullPageLoader";
import { IExtensionModel } from "../extension.model";
import { Web3Controller } from "../../../../domains/web3/web3.controller";
import { StreamerContainer } from "../../streamer/components/StreamerContainer";
import { ReactElement } from "react";
import Snackbar from "../../../../domains/snackbar/Snackbar";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import CenteredContainer from "../../../../components/container/CenteredContainer";
import { StreamerUiController } from "../../streamer/streamer-ui.controller";
import { DevTools } from "../../dev-tools/components/DevTools";
import { ConfigUiController } from "../../config/config-ui.controller";
import { ConfigContainer } from "../../config/components/ConfigContainer";

interface Props {
  model: IExtensionModel;
  operations: {
    web3: Web3Controller;
    streamerUi: StreamerUiController;
    configUi: ConfigUiController;
    snackbar: SnackbarController;
  };
}

export const Extension = observer(function App({ model, operations }: Props) {
  const appMetaData = model.meta;

  let content: string | ReactElement = "";
  switch (model.mode) {
    case "CONFIG":
      content = <ConfigContainer model={model} operations={operations} />;
      break;
    case "PANEL":
      content = "Panel mode";
      break;
    case "STREAMER":
      content = <StreamerContainer model={model} operations={operations} />;
      break;
    default:
      content = "Unknown mode"; // show some "Oops page with redirect to /panel"
      break;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {appMetaData.isLoading ? (
        <FullPageLoader />
      ) : appMetaData.error ? (
        <ErrorWithRetry text={appMetaData.error.message} withRetry={true} />
      ) : (
        <>
          <CenteredContainer>
            <>{content}</>
          </CenteredContainer>
          {CONFIG.isDevelopment ? <DevTools model={model} operations={operations} /> : null}
        </>
      )}

      <Snackbar model={{ snackbar: model.snackbar }} operations={operations.snackbar} />
    </ThemeProvider>
  );
});
