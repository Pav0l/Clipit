import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { initDemoSynchronous, initDemoAsync, initDemoClients } from "./init";
import { AppError } from "../lib/errors/errors";
import { Demo } from "./domains/demo/components/Demo";

(async () => {
  window.clipit = {
    build: {
      commit: COMMIT_HASH,
      mode: "demo",
    },
  };

  const { model, operations, clients } = initDemoSynchronous(CONFIG, initDemoClients(CONFIG));

  model.meta.setLoading(true);

  ReactDOM.render(
    <React.StrictMode>
      <Demo model={model} operations={operations} sentry={clients.sentry} />
    </React.StrictMode>,
    document.getElementById("root")
  );

  try {
    await initDemoAsync({
      model,
      user: operations.user,
      navigator: operations.navigator,
      oauth: operations.auth,
      analytics: clients.analytics,
    });
  } catch (error) {
    clients.sentry.captureException(error);
    model.meta.setError(new AppError({ msg: "Error while initializing app", type: "init" }));
  }

  model.meta.setLoading(false);
})();
