import { SESSION_ID } from "../../../lib/constants";
import { TelemetryClient } from "../../../lib/telemetry/telemetry.client";
import { IDemoModel } from "../app/demo.model";

export class TelemetryService {
  constructor(private model: IDemoModel, private client: TelemetryClient) {}

  loaded(slug: string) {
    this.client.recordLater(slug, this.prepareData("loaded", slug));
  }

  login(slug: string) {
    this.client.recordLater(slug, this.prepareData("login", slug));
  }

  thumbnail(slug: string) {
    this.client.recordLater(slug, this.prepareData("thumbnail", slug));
  }

  waitlist(slug: string) {
    this.client.recordLater(slug, this.prepareData("waitlist", slug));
  }

  private prepareData(name: string, slug: string) {
    return {
      event: name,
      session_id: SESSION_ID,
      date_created: Date.now(),
      user_id: this.model.user.id ?? null,
      email: this.model.user.email ?? null,
      display_name: this.model.user.display_name ?? null,
      clip_id: slug,
      host: window.location.host,
      ua: window.navigator.userAgent,
      ref: document.referrer,
    };
  }
}
