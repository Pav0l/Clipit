import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { initSynchronous, initAsync } from "./init";
import { App } from "./domains/app/components/App";

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
    await initAsync({ model, user: operations.user, web3: operations.web3, nft: operations.nft });
  } catch (error) {
    sentry.captureException(error);
    model.meta.setError("Error while initializing app");
  }

  model.meta.setLoading(false);
})();
