import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { Extension } from "./domains/extension/components/Extension";
import { initExtAsync, initExtSynchronous } from "./init";
import { AppError } from "../lib/errors/errors";
import { parseTwitchQueryParams } from "../lib/twitch-extension/twitch-extension.client";

(async () => {
  const options = parseTwitchQueryParams();

  const { model, operations, logger, sentry, storage, twitch } = initExtSynchronous(options);

  logger.log(`Extension initialized in ${model.mode} mode.`, options);

  ReactDOM.render(
    <React.StrictMode>
      <Extension model={model} operations={operations} />
    </React.StrictMode>,
    document.getElementById("root")
  );

  model.meta.setLoading(true);

  try {
    await initExtAsync({
      model,
      user: operations.user,
      web3: operations.web3,
      streamerUi: operations.streamerUi,
      configUi: operations.configUi,
      broadcasterAuth: operations.broadcasterAuth,
      twitch: twitch,
      logger,
      storage,
    });
  } catch (error) {
    logger.log("init error:", error);
    sentry.captureException(error);

    if (error instanceof AppError) {
      if (!error.isDevOnly) {
        model.meta.setError(error);
      }
    }

    model.meta.setError(new AppError({ msg: "Error while initializing extension", type: "init" }));
  }

  model.meta.setLoading(false);
})();
