import { makeAutoObservable } from "mobx"
import { MetaModel } from "../app/meta.model";


interface User {
  id: string;
  display_name: string;
  login: string; // login name
  profile_image_url: string;
  email: string;
}

export class UserModel {
  id: string = "";
  display_name: string = "";
  login: string = "";
  profile_image_url: string = "";
  email: string = "";

  meta: MetaModel;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setUser(user: User) {
    this.id = user.id;
    this.display_name = user.display_name;
    this.login = user.login;
    this.profile_image_url = user.profile_image_url;
    this.email = user.email;
  }
}

