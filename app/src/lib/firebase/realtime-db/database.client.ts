import { initializeApp } from "firebase/app";
import { getDatabase, Database, ref, push } from "firebase/database";

import { FirebaseConfig } from "../firebase.config";

export interface IDatabase {
  append: (path: string, value: unknown) => Promise<void>;
}

export class DatabaseClient implements IDatabase {
  private db: Database;

  constructor(config: FirebaseConfig) {
    const app = initializeApp(config);
    this.db = getDatabase(app, config.databaseURL);
    this.db.app.automaticDataCollectionEnabled = false;
  }

  append = async (path: string, value: unknown) => {
    await push(ref(this.db, path), value);
  };
}
