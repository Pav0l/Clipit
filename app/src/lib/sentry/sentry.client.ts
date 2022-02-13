import * as Sentry from "@sentry/react";

export class SentryClient {
  constructor(isDevelopment: boolean) {
    Sentry.init({
      dsn: "https://fd10b02665ca44c4be2c4c48de2b7442@o1142885.ingest.sentry.io/6201909",
      enabled: isDevelopment ? false : true,
      // TODO setup `release` and `environment` options
    });
  }

  captureException(err: unknown) {
    Sentry.captureException(err);
  }

  captureMessage(msg: string) {
    Sentry.captureMessage(msg);
  }

  captureEvent(event: { message?: string; contexts?: Record<string, Record<string, unknown>> }) {
    Sentry.captureEvent(event);
  }
}
