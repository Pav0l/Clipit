import { IAnalytics } from "./analytics.client";

export class AnalyticsTestClient implements IAnalytics {
  setProperty(_key: string, _value: unknown) {
    // do nothing
  }

  logPageView(_params: { page_path?: string }) {
    // do nothing
  }
}
