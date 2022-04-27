import { IDatabase } from "../firebase/realtime-db/database.client";
import { SentryClient } from "../sentry/sentry.client";

export class TelemetryClient {
  constructor(private db: IDatabase, private sentry: SentryClient) {}

  recordLater(slug: string, value: unknown = {}) {
    this.db.append(this.buildPath(slug), value).catch((err) => {
      this.sentry.captureException(err, {
        extra: { clip_id: slug, value },
      });
    });
  }

  async record(slug: string, value: unknown) {
    try {
      await this.db.append(this.buildPath(slug), value);
    } catch (err) {
      this.sentry.captureException(err, {
        extra: { clip_id: slug, value },
      });
    }
  }

  private buildPath(id: string) {
    return `telemetry/${id}`;
  }
}
