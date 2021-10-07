import { makeAutoObservable } from "mobx"
import { MetaStore } from "../../store/meta.store";


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

  meta: MetaStore;

  constructor(metaStore: MetaStore) {
    makeAutoObservable(this);
    this.meta = metaStore;
  }

  setUser(user: User) {
    this.id = user.id;
    this.display_name = user.display_name;
    this.login = user.login;
    this.profile_image_url = user.profile_image_url;
    this.email = user.email;
  }
}

