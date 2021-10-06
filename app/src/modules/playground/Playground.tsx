import { isObservable, isComputed, spy, isObservableProp } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useStore } from "../../store/StoreProvider";

const Playground = observer(function Playground() {
  const { testStore } = useStore();

  useEffect(() => {
    if (testStore.mightHaveText) {
      console.log("we DO have text:", testStore.mightHaveText);
    } else {
      console.log("NO TEXT");
    }
  }, [testStore.mightHaveText]);

  useEffect(() => {
    if (testStore.yesText) {
      console.log("we DO have yes text:", testStore.yesText);
    } else {
      console.log("NO YES TEXT");
    }
  }, [testStore.yesText]);

  return (
    <div>
      <button onClick={() => testStore.setText("text is here")}>
        SET TEXT
      </button>
      <button onClick={() => testStore.setYesText("yes yes yes")}>
        SET YES TEXT
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
