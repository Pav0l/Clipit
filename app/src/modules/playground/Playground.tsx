import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import ErrorBoundary from "../error/ErrorBoundry";

const Playground = observer(function Playground() {
  return (
    <div>
      <div>Two in one</div>
      <ErrorBoundary>
        <BuggyCounter />
        <BuggyCounter />
      </ErrorBoundary>

      <div>Two separate</div>
      <ErrorBoundary>
        <BuggyCounter />
      </ErrorBoundary>
      <ErrorBoundary>
        <BuggyCounter />
      </ErrorBoundary>
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
