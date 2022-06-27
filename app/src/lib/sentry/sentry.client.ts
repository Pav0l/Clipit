import * as Sentry from "@sentry/react";
import { CaptureContext } from "@sentry/types";
import { SESSION_ID } from "../constants";
export class SentryClient {
  constructor(dsn: string, isDevelopment: boolean) {
    Sentry.init({
      dsn: dsn,
      enabled: isDevelopment ? false : true,
    });

    Sentry.setTag("COMMIT_HASH", COMMIT_HASH);
    Sentry.setTag("SESSION_ID", SESSION_ID);
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
