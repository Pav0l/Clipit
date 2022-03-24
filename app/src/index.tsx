import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { initSynchronous, initAsync } from "./init";
import { App } from "./domains/app/components/App";
import { AppError } from "./lib/errors/errors";

(async () => {
  const { model, operations, sentry } = initSynchronous();

  model.meta.setLoading(true);

  ReactDOM.render(
    <React.StrictMode>
      <App model={model} operations={operations} sentry={sentry} />
    </React.StrictMode>,
    document.getElementById("root")
  );

  try {
    await initAsync({
      model,
      user: operations.user,
      web3: operations.web3,
      nft: operations.nft,
      navigator: operations.navigator,
    });
  } catch (error) {
    sentry.captureException(error);
    model.meta.setError(new AppError({ msg: "Error while initializing app", type: "init" }));
  }

  model.meta.setLoading(false);
})();
