import { MetaModel } from "../../../domains/app/meta.model";
import { ExtensionMode } from "./extension.interfaces";

export interface IExtensionModel {
  meta: MetaModel;
  mode: ExtensionMode;
}

export class ExtensionModel implements IExtensionModel {
  meta: MetaModel;
  mode: ExtensionMode;

  constructor(mode: ExtensionMode) {
    this.meta = new MetaModel();
    this.mode = mode;
  }
}
