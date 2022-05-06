import { render } from "@testing-library/react";

import ThemeProvider from "../src/domains/theme/components/ThemeProvider";
import { App } from "../src/app/components/App";
import { AppInit } from "../src/init";

export function renderAppForTests(init: AppInit) {
  const component = (
    <ThemeProvider model={init.model.theme}>
      <App model={init.model} operations={init.operations} />
    </ThemeProvider>
  );

  return render(component);
}
