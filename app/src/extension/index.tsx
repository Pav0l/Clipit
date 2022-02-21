import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { Extension } from "./domains/extension/components/Extension";
import { initExtSynchronous } from "./init";

(async () => {
  const path = location.pathname;
  // Twitch global var injected in index.html via <script>
  const twitchHelper = Twitch.ext;

  const { model, logger } = initExtSynchronous(path, twitchHelper);

  logger.log(`Extension initialized in ${model.mode} mode.`, parseTwitchQueryParams());

  ReactDOM.render(
    <React.StrictMode>
      <Extension model={model} operations={{}} />
    </React.StrictMode>,
    document.getElementById("root")
  );
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
