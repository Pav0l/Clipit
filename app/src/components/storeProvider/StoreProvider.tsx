import { createContext, useContext } from "react";
import { AppModel, appModel } from "../../domains/app/app.model";

const StoreContext = createContext<AppModel>(appModel);

export function StoreProvider({ children }: { children: JSX.Element }) {
  return (
    <StoreContext.Provider value={appModel}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctxValue = useContext(StoreContext);

  if (ctxValue === undefined) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return ctxValue;
}
