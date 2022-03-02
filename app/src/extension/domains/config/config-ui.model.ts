import { makeAutoObservable } from "mobx";
import { MetaModel } from "../../../domains/app/meta.model";

export interface IConfigUiModel {
  meta: MetaModel;
}

type ConfigPage = "MISSING_PROVIDER" | "CHANGE_PROVIDER";

export class ConfigUiModel implements IConfigUiModel {
  meta: MetaModel;
  page: ConfigPage = "MISSING_PROVIDER";

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  goToMissingProvider() {
    this.setPage("MISSING_PROVIDER");
  }

  goToChangeProvider() {
    this.setPage("CHANGE_PROVIDER");
  }

  private setPage(page: ConfigPage) {
    this.page = page;
  }
}
