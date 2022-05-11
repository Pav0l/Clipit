import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { initSynchronous, initAsync, initClients } from "./init";
import { App } from "./app/components/App";
import { AppError } from "./lib/errors/errors";

(async () => {
  window.clipit = {
    build: {
      commit: COMMIT_HASH,
      mode: "app",
    },
  };

  const { model, operations, clients } = initSynchronous(CONFIG, initClients(CONFIG));

  model.meta.setLoading(true);

  ReactDOM.render(
    <React.StrictMode>
      <App model={model} operations={operations} sentry={clients.sentry} />
    </React.StrictMode>,
    document.getElementById("root")
  );

  try {
    await initAsync({
      model,
      operations,
    });
  } catch (error) {
    clients.sentry.captureException(error);
    model.meta.setError(new AppError({ msg: "Error while initializing app", type: "init" }));
  }

  model.meta.setLoading(false);
})();
