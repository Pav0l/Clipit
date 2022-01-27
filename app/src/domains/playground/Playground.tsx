import { observer } from "mobx-react-lite";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { makeStyles, Theme } from "@material-ui/core";
import { NftModel } from "../nfts/nft.model";
import { IWeb3Controller } from "../web3/web3.controller";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: {
    web3: IWeb3Controller;
    snackbar: SnackbarClient;
  };
}

const Playground = observer(function Playground({ operations }: Props) {
  const classes = useStyles();

  const onClick = async () => {
    try {
      // do something
    } catch (error) {
      operations.snackbar.sendError((error as Error).message);
      return;
    }
  };

  return (
    <div>
      <button onClick={onClick}>Do something!</button>
      <button
        className={classes.btn}
        onClick={() => operations.snackbar.sendError(`text is here: ${Math.random() * 1000}`)}
      >
        SET ERROR
      </button>
      <button
        className={classes.btn2}
        onClick={() => operations.snackbar.sendSuccess(`yes yes yes: ${Math.random() * 1000}`)}
      >
        SET SUCCESS
      </button>
      <button className={classes.btn} onClick={() => operations.snackbar.sendInfo(`infoo: ${Math.random() * 1000}`)}>
        SET INFO
      </button>
    </div>
  );
});

export default Playground;

const useStyles = makeStyles<Theme>((theme) => ({
  btn: {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  btn2: {
    background: theme.palette.background.default,
    color: theme.palette.text.secondary,
  },
}));
