import { observer } from "mobx-react-lite";
import { createContext, useContext } from "react";
import { TawkClient } from "../../../lib/tawk/tawk.client";
import { SupportWidgetService } from "../support-widget.service";

const widgetService = new SupportWidgetService(new TawkClient());
const SupportContext = createContext<SupportWidgetService>(widgetService);

export const useSupportWidget = () => useContext(SupportContext);

export const SupportWidgetProvider = observer(function SupportProvider({ children }) {
  return <SupportContext.Provider value={widgetService}>{children}</SupportContext.Provider>;
});
