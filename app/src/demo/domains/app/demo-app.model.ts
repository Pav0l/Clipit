import { MetaModel } from "../../../domains/app/meta.model";
import { SnackbarModel } from "../../../domains/snackbar/snackbar.model";
import { UserModel } from "../../../domains/twitch-user/user.model";
import { OAuthModel } from "../../../domains/twitch-oauth/oauth.model";
import { NavigationModel } from "../../../domains/navigation/navigation.model";
import { ThemeModel } from "../../../domains/theme/theme.model";
import { DemoModel } from "../demo/demo.model";

export interface IDemoAppModel {
  meta: MetaModel;
  user: UserModel;

  theme: ThemeModel;
  auth: OAuthModel;
  snackbar: SnackbarModel;
  navigation: NavigationModel;

  demo: DemoModel;
}

export class DemoAppModel implements IDemoAppModel {
  meta: MetaModel;

  user: UserModel;
  snackbar: SnackbarModel;
  auth: OAuthModel;
  navigation: NavigationModel;
  theme: ThemeModel;

  demo: DemoModel;

  constructor() {
    this.meta = new MetaModel();

    this.user = new UserModel(new MetaModel());
    this.auth = new OAuthModel(new MetaModel());

    this.theme = new ThemeModel();
    this.navigation = new NavigationModel();
    this.snackbar = new SnackbarModel();

    this.demo = new DemoModel();
  }
}
