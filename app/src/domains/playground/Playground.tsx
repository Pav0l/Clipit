import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
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
        onClick={() =>
          operations.snackbar.sendError(`text is here: ${Math.random() * 1000}`)
        }
      >
        SET ERROR
      </button>
      <button
        className={classes.btn2}
        onClick={() =>
          operations.snackbar.sendSuccess(
            `yes yes yes: ${Math.random() * 1000}`
          )
        }
      >
        SET SUCCESS
      </button>
      <button
        className={classes.btn}
        onClick={() =>
          operations.snackbar.sendInfo(`infoo: ${Math.random() * 1000}`)
        }
      >
        SET INFO
      </button>
    </div>
  );
});

export default Playground;

const useStyles = makeStyles<Theme>((theme) => ({
  btn: {
    background: theme.palette.background.default,
    color: theme.palette.text.primary
  },
  btn2: {
    background: theme.palette.background.default,
    color: theme.palette.text.secondary
  }
}));

function BuggyCounter() {
  const [counter, setCount] = useState(0);

  const handleClick = () => {
    setCount(counter + 1);
  };

  useEffect(() => {
    if (counter === 3) {
      throwSomething();
    }
  }, [counter]);

  const throwSomething = () => {
    throw new Error("Throwing some error");
  };

  if (counter === 5) {
    throw new CustomError("CUSTOM ERROR!", 456, { kung: "foo" });
  }

  return (
    <div>
      <h1 onClick={handleClick}>{counter}</h1>
      <button onClick={throwSomething}>THROW</button>
    </div>
  );
}

class CustomError extends Error {
  code: number;
  data: any;

  constructor(msg: string, code: number, data: any) {
    super(msg);
    this.code = code;
    this.name = "CustomError";
    this.data = data;
  }
}
