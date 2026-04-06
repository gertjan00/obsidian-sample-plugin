import { AppwriteHttpService } from "./http";
import { Models } from "node-appwrite";

import { template } from "types/schema-template";

export class AppwriteSchemaService {
	constructor(private readonly http: AppwriteHttpService) {}

	async updateSchema(contentEl?: HTMLDivElement): Promise<void> {
		console.log("Updating schema");

		const logMessage = (
			msg: string,
			indentation: number,
			color: string = "#d1d1d1",
		) => {
			if (contentEl) {
				contentEl.createEl("div", {
					attr: {
						style: `
							color: ${color}; 
							margin: 0; 
							white-space: pre-wrap; 
							padding-left: ${indentation * 8}px;
							border-left: ${indentation > 0 ? "1px solid #" : "none"};
							margin-bottom: 2px;
						`,
					},
					text:
						(indentation === 0 ? "> " : " ".repeat(indentation)) +
						msg,
				});

				contentEl.scrollTop = contentEl.scrollHeight;
			}
			console.log(msg);
		};
		logMessage("Database resetten", 0);
		await this.resetAll();
		await sleep(1000);

		logMessage("Starting setup database", 0);

		for (const db of template.databases) {
			try {
				logMessage(` - creating database '${db.id}'`, 0);
				await this.createDatabase(db.id, db.name);
			} catch (e: any) {
				if (e.status == 404 || e.status == 409) {
					logMessage(` - database '${db.id}' already exists.`, 2);
				} else {
					console.error(e);
				}
			}

			for (const table of db.tables) {
				try {
					logMessage(` - creating table '${table.id}'`, 2);
					await this.createTable(db.id, table.id, table.name);
				} catch (e: any) {
					if (e.status == 404 || e.status == 409) {
						logMessage(` - table '${table.id}' already exists.`, 4);
					} else {
						logMessage(e, 4);
					}
				}

				for (const column of table.columns) {
					try {
						const url = `/tablesdb/${db.id}/tables/${table.id}/columns/${column.type}`;
						const body: any = { ...column };
						delete body.type;

						logMessage(
							` - creating column '${column.key}' (${column.type})`,
							4,
						);
						await this.http.request("POST", url, body);
					} catch (e: any) {
						if (e.status == 404 || e.status == 409) {
							logMessage(
								` - column '${column.key}' already exists.`,
								6,
							);
						} else {
							logMessage(e, 6);
						}
					}
					await sleep(50);
				}
			}
		}
		logMessage("Updating schema finished", 0);
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
