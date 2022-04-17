import { initializeApp } from "firebase/app";
import { initializeAnalytics, Analytics, setUserProperties, logEvent } from "firebase/analytics";
import { FirebaseConfig } from "./firebase.config";

export interface IAnalytics {
  setProperty(key: string, value: unknown): void;
  logPageView(params: { page_path?: string }): void;
}

export class AnalyticsClient implements IAnalytics {
  private analytics: Analytics;

  constructor(config: FirebaseConfig) {
    const app = initializeApp(config);
    this.analytics = initializeAnalytics(app, {
      config: {
        "allow_google_signals?": false,
        allow_ad_personalization_signals: false,
        allow_google_signals: false,
        anonymize_ip: true,
        anonymizeIp: true,
      },
    });

    this.analytics.app.automaticDataCollectionEnabled = false;
  }

  setProperty(key: string, value: unknown) {
    setUserProperties(this.analytics, { [key]: value });
  }

  logPageView(params: { page_path?: string }) {
    logEvent(this.analytics, "page_view", params);
  }
}
