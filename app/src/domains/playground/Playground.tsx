import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { snackbarClient } from "../../lib/snackbar/snackbar.client";
import { makeStyles, Theme } from "@material-ui/core";

const Playground = observer(function Playground() {
  const classes = useStyles();

  return (
    <div>
      <button
        className={classes.btn}
        onClick={() => snackbarClient.sendError("text is here")}
      >
        SET ERROR
      </button>
      <button
        className={classes.btn2}
        onClick={() => snackbarClient.sendSuccess("yes yes yes")}
      >
        SET SUCCESS
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
