import { AppwriteHttpService } from "./http";
import { Models } from "node-appwrite";

import { template } from "types/schema-template";
import { SyncLogger } from "types/synclogger";

export class AppwriteSchemaService {
	constructor(private readonly http: AppwriteHttpService) {}

	async updateSchema(logger?: SyncLogger): Promise<void> {
		console.log("Updating schema");

		const log = (msg: string, indent: number = 0, color?: string) => {
			if (logger) logger.log(msg, indent, color);
		};

		log("Database resetten", 0);
		await this.resetAll();
		await sleep(1000);

		log("Starting setup database", 0);

		for (const db of template.databases) {
			try {
				log(` - creating database '${db.id}'`, 0);
				await this.createDatabase(db.id, db.name);
			} catch (e: any) {
				if (e.status == 404 || e.status == 409) {
					log(` - database '${db.id}' already exists.`, 2);
				} else {
					console.error(e);
				}
			}

			for (const table of db.tables) {
				try {
					log(` - creating table '${table.id}'`, 2);
					await this.createTable(db.id, table.id, table.name);
				} catch (e: any) {
					if (e.status == 404 || e.status == 409) {
						log(` - table '${table.id}' already exists.`, 4);
					} else {
						log(e, 4);
					}
				}

				for (const column of table.columns) {
					try {
						const url = `/tablesdb/${db.id}/tables/${table.id}/columns/${column.type}`;
						const body: any = { ...column };
						delete body.type;

						log(
							` - creating column '${column.key}' (${column.type})`,
							4,
						);
						await this.http.request("POST", url, body);
					} catch (e: any) {
						if (e.status == 404 || e.status == 409) {
							log(` - column '${column.key}' already exists.`, 6);
						} else {
							log(e, 6);
						}
					}
					await sleep(50);
				}
			}
		}
		log("Updating schema finished", 0);
	}

	async listTeams(): Promise<Models.TeamList> {
		return await this.http.request("GET", `/teams`);
	}

	async getTeam(teamId: string): Promise<Models.Team> {
		return await this.http.request("GET", `/teams/${teamId}`);
	}

	async createTeam(teamId: string, name: string): Promise<Models.Team> {
		return await this.http.request("POST", `/teams`, {
			teamId: teamId,
			name: name,
		});
	}

	async listDatabases(): Promise<Models.DatabaseList> {
		return await this.http.request("GET", `/tablesdb/`);
	}

	async getDatabase(databaseId: string): Promise<Models.Database> {
		return await this.http.request("GET", `/tablesdb/${databaseId}`);
	}

	async createDatabase(
		databaseId: string,
		name: string,
	): Promise<Models.Database> {
		return await this.http.request<Models.Database>("POST", "/tablesdb", {
			databaseId: databaseId,
			name: name,
		});
	}

	async getTable(databaseId: string, tableId: string): Promise<Models.Table> {
		return await this.http.request(
			"GET",
			`/tablesdb/${databaseId}/tables/${tableId}`,
		);
	}

	async listTables(databaseId: string): Promise<Models.TableList> {
		return await this.http.request("GET", `/tablesdb/${databaseId}/tables`);
	}

	// TODO verder invullen. deze functie kan je pas uitvoeren als er een team is aangemaakt
	// Permissions any is niet handig
	async createTable(
		databaseId: string,
		tableId: string,
		name: string,
	): Promise<Models.Table> {
		return await this.http.request(
			"POST",
			`/tablesdb/${databaseId}/tables`,
			{
				tableId: tableId,
				name: name,
				permissions: ['read("any")'],
				rowSecurity: false,
				enabled: false,
				columns: [],
				indexes: [],
			},
		);
	}

	// DANGER ZONE

	async deleteDatabase(databaseId: string): Promise<void> {
		await this.http.request("DELETE", `/tablesdb/${databaseId}`);
	}

	// Deze functie alleen tijdens testen gebruiken
	async resetAll() {
		console.info("Start reset alles");
		const dbList = await this.listDatabases();

		dbList.databases.forEach(async (db) => {
			try {
				console.log(`"${db.name}" verwijderen`);
				await this.deleteDatabase(db.$id);
			} catch (e: any) {
				if (e) console.error(e);
			}
		});
	}
}
