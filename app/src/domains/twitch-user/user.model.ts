import { makeAutoObservable } from "mobx";
import { MetaModel } from "../meta/meta.model";

interface User {
  id?: string;
  display_name?: string;
  login?: string; // login name
  profile_image_url?: string;
  email?: string;
}

export class UserModel {
  id = "";
  display_name = "";
  login = "";
  profile_image_url = "";
  email = "";

  meta: MetaModel;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setUser(user: User) {
    this.id = user.id ?? "";
    this.display_name = user.display_name ?? "";
    this.login = user.login ?? "";
    this.profile_image_url = user.profile_image_url ?? "";
    this.email = user.email ?? "";
  }
}
