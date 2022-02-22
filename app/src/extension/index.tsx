import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { Extension } from "./domains/extension/components/Extension";
import { initExtAsync, initExtSynchronous } from "./init";

(async () => {
  const path = location.pathname;
  // Twitch global var injected in index.html via <script>
  const twitchHelper = Twitch.ext;

  const { model, operations, logger, sentry, storage } = initExtSynchronous(path, twitchHelper);

  logger.log(`Extension initialized in ${model.mode} mode.`, parseTwitchQueryParams());

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
      web3: operations.web3,
      streamerUi: operations.streamerUi,
      twitch: twitchHelper,
      logger,
      storage,
    });
  } catch (error) {
    logger.log("init error:", error);
    sentry.captureException(error);
    model.meta.setError("Error while initializing extension");
  }

  model.meta.setLoading(false);
})();

// TODO move somewhere when used
// https://dev.twitch.tv/docs/extensions/reference#client-query-parameters
function parseTwitchQueryParams() {
  const searchParams = new URL(location.href).searchParams;

  return {
    anchor: searchParams.get("anchor"),
    language: searchParams.get("language"),
    locale: searchParams.get("locale"),
    mode: searchParams.get("mode"),
    platform: searchParams.get("platform"),
    popout: searchParams.get("popout"),
    state: searchParams.get("state"),
  };
}
