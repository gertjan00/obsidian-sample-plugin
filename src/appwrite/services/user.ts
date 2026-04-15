import { TablesDB } from "appwrite";
import { ObsidianUserClient } from "appwrite/obsidian-clients";
import { DatabaseTables } from "generated/appwrite";
import { createDatabasesApi } from "generated/appwrite/databases";

export class AppwriteUserService {
	public tablesDB: TablesDB;
	public databases: DatabaseTables;

	constructor(userClient: ObsidianUserClient) {
		this.tablesDB = new TablesDB(userClient);
		this.databases = createDatabasesApi(this.tablesDB);
	}
}
