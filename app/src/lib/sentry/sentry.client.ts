import * as Sentry from "@sentry/react";
import { CaptureContext } from "@sentry/types";
export class SentryClient {
  constructor(dsn: string, isDevelopment: boolean) {
    Sentry.init({
      dsn: dsn,
      enabled: isDevelopment ? false : true,
      // TODO setup `release` and `environment` options
    });

    Sentry.setTag("COMMIT_HASH", COMMIT_HASH);
  }

  captureException(err: unknown, ctx?: CaptureContext) {
    Sentry.captureException(err, ctx);
  }

  captureMessage(msg: string) {
    Sentry.captureMessage(msg);
  }

  captureEvent(event: { message?: string; contexts?: Record<string, Record<string, unknown>> }) {
    Sentry.captureEvent(event);
  }
}
