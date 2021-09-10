import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import { AppRoute } from "./lib/constants";

async function initializeAppPerRoute() {
  const url = new URL(location.href);
  const path = url.pathname;

  if (path.startsWith(AppRoute.ABOUT)) {
  }
}

(async () => {
  try {
    await initializeAppPerRoute();

    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById("root")
    );
  } catch (error) {
    ReactDOM.render(
      <React.StrictMode>
        {/* TODO */}
        <div>Error while initializing app</div>
      </React.StrictMode>,
      document.getElementById("root")
    );
  }
})();
