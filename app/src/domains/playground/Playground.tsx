import { observer } from "mobx-react-lite";
import { SnackbarClient } from "../snackbar/snackbar.controller";
import { NftModel } from "../nfts/nft.model";
import { IWeb3Controller } from "../web3/web3.controller";
import { TestStore } from "./playground.store";
import { makeAppStyles } from "../theme/theme.constants";

interface Props {
  model: {
    nft: NftModel;
    testStore: TestStore;
  };
  operations: {
    web3: IWeb3Controller;
    snackbar: SnackbarClient;
  };
}

const Playground = observer(function Playground({ model, operations }: Props) {
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
        onClick={() => {
          model.testStore.addData({ id: 1, text: `text is here: ${Math.random() * 1000}` });
          model.testStore.addData({ id: 2, text: `text is here: ${Math.random() * 1000}` });
          model.testStore.addData({ id: 3, text: `text is here: ${Math.random() * 1000}` });
        }}
      >
        add data
      </button>
      <button onClick={() => model.testStore.replaceData({ id: 2, text: `wauza` })}>replace data</button>
      <button className={classes.btn} onClick={() => operations.snackbar.sendInfo(`infoo: ${Math.random() * 1000}`)}>
        SET INFO
      </button>
      <div>
        data: <br />
        {JSON.stringify(model.testStore.data)}
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
