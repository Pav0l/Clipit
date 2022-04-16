import { MetaModel } from "../../../domains/app/meta.model";
import { SnackbarModel } from "../../../domains/snackbar/snackbar.model";
import { UserModel } from "../../../domains/twitch-user/user.model";
import { OAuthModel } from "../../../domains/twitch-oauth/oauth.model";
import { NavigationModel } from "../../../domains/navigation/navigation.model";
import { ThemeModel } from "../../../domains/theme/theme.model";
import { ClipModel } from "../../../domains/twitch-clips/clip.model";

export interface IDemoModel {
  meta: MetaModel;
  user: UserModel;
  clip: ClipModel;

  theme: ThemeModel;
  auth: OAuthModel;
  snackbar: SnackbarModel;
  navigation: NavigationModel;
}

export class DemoModel implements IDemoModel {
  meta: MetaModel;

  user: UserModel;
  clip: ClipModel;

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
  }
}
