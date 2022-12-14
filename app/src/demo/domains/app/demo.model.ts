import { MetaModel } from "../../../domains/meta/meta.model";
import { SnackbarModel } from "../../../domains/snackbar/snackbar.model";
import { UserModel } from "../../../domains/twitch-user/user.model";
import { OAuthModel } from "../../../domains/twitch-oauth/oauth.model";
import { NavigationModel } from "../../../domains/navigation/navigation.model";
import { ThemeModel } from "../../../domains/theme/theme.model";
import { ClipModel } from "../../../domains/twitch-clips/clip.model";
import { TelemetryModel } from "../telemetry/telemetry.model";

export type Mode = "video" | "thumbnail";

export interface IDemoModel {
  meta: MetaModel;
  mode: Mode;
  user: UserModel;
  clip: ClipModel;
  telemetry: TelemetryModel;
  theme: ThemeModel;
  auth: OAuthModel;
  snackbar: SnackbarModel;
  navigation: NavigationModel;
}

export class DemoModel implements IDemoModel {
  meta: MetaModel;

  mode: Mode = "video";

  user: UserModel;
  clip: ClipModel;
  telemetry: TelemetryModel;
  snackbar: SnackbarModel;
  auth: OAuthModel;
  navigation: NavigationModel;
  theme: ThemeModel;

  constructor() {
    this.meta = new MetaModel();

    this.user = new UserModel(new MetaModel());
    this.auth = new OAuthModel(new MetaModel());
    this.clip = new ClipModel(new MetaModel());

    this.theme = new ThemeModel();
    this.navigation = new NavigationModel();
    this.snackbar = new SnackbarModel();
    this.telemetry = new TelemetryModel();
  }

  setMode(mode: Mode) {
    this.mode = mode;
  }
}
