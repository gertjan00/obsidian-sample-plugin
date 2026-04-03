import { AppwriteHttpService } from "./http";
import { Models } from "node-appwrite";

export class AppwriteSchemaService {
	constructor(private readonly http: AppwriteHttpService) {}

	async checkSchema(): Promise<void> {}

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
}
