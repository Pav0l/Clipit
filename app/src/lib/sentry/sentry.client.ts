import * as Sentry from "@sentry/react";

export class SentryClient {
  constructor(dsn: string, isDevelopment: boolean) {
    Sentry.init({
      dsn: dsn,
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
