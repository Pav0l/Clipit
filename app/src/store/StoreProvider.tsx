import { createContext, useContext } from "react";
import { IStore, store } from "./root.store";

const StoreContext = createContext<IStore>(store);

export function StoreProvider({ children }: { children: JSX.Element }) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctxValue = useContext(StoreContext);

  if (ctxValue === undefined) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return ctxValue;
}
