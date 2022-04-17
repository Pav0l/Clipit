import { observer } from "mobx-react-lite";
import { makeAppStyles } from "../theme/theme.constants";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { IWeb3Controller } from "../web3/web3.controller";
import { AppModel } from "../../app/app.model";
import { NavigatorController } from "../navigation/navigation.controller";
import { AppRoute } from "../../lib/constants";

interface Props {
  model: AppModel;
  operations: {
    web3: IWeb3Controller;
    snackbar: SnackbarClient;
    navigator: NavigatorController;
  };
}

const Playground = observer(function Playground({ model, operations }: Props) {
  const classes = useStyles();

  const onClick = async () => {
    try {
      // do something
      operations.navigator.goToRoute(AppRoute.ABOUT);
    } catch (error) {
      operations.snackbar.sendError((error as Error).message);
      return;
    }
  };

  return (
    <div data-testid="about">
      <div>ENS name: {model.web3.ensName}</div>
      <button onClick={onClick}>/about</button>
      <button
        className={classes.btn}
        onClick={() => {
          operations.navigator.goToRoute(AppRoute.HOME);
        }}
      >
        /home
      </button>
      <div>
        data: <br />
        {JSON.stringify(model.navigation)}
      </div>
    </div>
  );
});

export default Playground;

const useStyles = makeAppStyles((theme) => ({
  btn: {
    background: theme.colors.background_primary,
    color: theme.colors.text_primary,
  },
  btn2: {
    background: theme.colors.background_primary,
    color: theme.colors.text_secondary,
  },
}));
