import React from "react";
import ReactDOM from "react-dom";

import "./index.css";

(async () => {
  const path = location.pathname;
  enum ALLOWED_PATHS {
    CONFIG = "/config",
    VIEWER = "/viewer",
    STREAMER = "/streamer",
    PANEL = "/panel",
  }

  let content = "";
  if (path.includes(ALLOWED_PATHS.VIEWER)) {
    content = "Hello viewer";
  } else if (path.includes(ALLOWED_PATHS.PANEL)) {
    content = "Hello panel";
  } else if (path.includes(ALLOWED_PATHS.CONFIG)) {
    content = "Hello config";
  } else if (path.includes(ALLOWED_PATHS.STREAMER)) {
    content = "Hello streamer";
  } else {
    content = `Unknown pathname: ${path}`;
  }

  ReactDOM.render(
    <React.StrictMode>
      <div>{content}</div>
    </React.StrictMode>,
    document.getElementById("root")
  );
})();
