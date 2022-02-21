import { observer } from "mobx-react-lite";

import ThemeProvider from "../../../../components/themeProvider/ThemeProvider";
import { defaultTheme } from "../../../../components/themeProvider/theme";
import ErrorWithRetry from "../../../../components/error/Error";
import FullPageLoader from "../../../../components/loader/FullPageLoader";
import { IExtensionModel } from "../extension.model";

interface Props {
  model: IExtensionModel;
  operations: {
    // TODO
  };
}

export const Extension = observer(function App({ model }: Props) {
  const appMetaData = model.meta;

  let content = "";
  switch (model.mode) {
    case "CONFIG":
      content = "Config mode";
      break;
    case "PANEL":
      content = "Panel mode";
      break;
    case "STREAMER":
      content = "Streamer mode";
      break;
    default:
      content = "Unknown mode"; // show some "Oops page with redirect to /panel"
      break;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {appMetaData.isLoading ? (
        <FullPageLoader />
      ) : appMetaData.hasError ? (
        <ErrorWithRetry text={appMetaData.error} withRetry={true} />
      ) : (
        // TODO
        <div>{content}</div>
      )}
    </ThemeProvider>
  );
});
