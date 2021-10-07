import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { snackbarClient } from "../../lib/snackbar/snackbar.client";
import { useStore } from "../../components/storeProvider/StoreProvider";

const Playground = observer(function Playground() {
  return (
    <div>
      <button onClick={() => snackbarClient.sendError("text is here")}>
        SET ERROR
      </button>
      <button onClick={() => snackbarClient.sendSuccess("yes yes yes")}>
        SET SUCCESS
      </button>
    </div>
  );
});

export default Playground;

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
