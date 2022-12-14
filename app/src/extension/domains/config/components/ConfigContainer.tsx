import { Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import ConnectMetamask from "../../../../components/connectMetamask/ConnectMetamask";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import { makeAppStyles } from "../../../../domains/theme/theme.constants";
import { IExtensionModel } from "../../extension/extension.model";
import { ConfigUiController } from "../config-ui.controller";

interface Props {
  model: IExtensionModel;
  operations: {
    snackbar: SnackbarController;
    configUi: ConfigUiController;
  };
}

export const ConfigContainer = observer(function ConfigContainer({ model, operations }: Props) {
  const classes = useStyles();

  let content: ReactElement | string;

  switch (model.configUi.page) {
    case "MISSING_PROVIDER":
      content = (
        <>
          <Typography className={classes.withMargin}>
            Connect your MetaMask wallet to be able to mint your Clips into NFTs
          </Typography>
          <ConnectMetamask
            model={{ web3: model.web3 }}
            onClick={operations.configUi.connectMetamask}
            onClickError={operations.snackbar.sendError}
          />
        </>
      );
      break;
    case "CHANGE_PROVIDER":
      content = (
        <>
          <Typography className={classes.withMargin}>Wallet connected!</Typography>
          <Typography>
            You can close this window and open the Extension via button in Stream Manager Quick Actions
          </Typography>
        </>
      );
      break;
    default:
      operations.configUi.goBackToProvider();
      content = "";
  }

  return <div className={classes.container}>{content}</div>;
});

const useStyles = makeAppStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  withMargin: {
    margin: "1rem 0",
  },
}));
