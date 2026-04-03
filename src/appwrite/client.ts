import { table } from "console";
import { Models } from "node-appwrite";
import { requestUrl, Notice } from "obsidian";
import { MyPluginSettings } from "settings";
import { AppwriteAPI } from "types/appwrite-api";

export class AppwriteService {
	private settings: MyPluginSettings;

	constructor(settings: MyPluginSettings) {
		this.settings = settings;
	}

	private async request<TResponse>(
		method: "GET" | "POST" | "DELETE",
		path: string,
		body?: unknown,
	): Promise<TResponse> {
		try {
			const res = await requestUrl({
				url: `${this.settings.appwriteEndpoint}${path}`,
				method: method,
				headers: {
					"Content-Type": "application/json",
					"X-Appwrite-Project": this.settings.appwriteProjectId,
					"X-Appwrite-Key": this.settings.appwriteApiKey,
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			if (!res.text || res.text.trim() === "") {
				return undefined as unknown as TResponse;
			}

			return res.json as TResponse;
		} catch (e) {
			throw e;
		}
	}

	async testConnection(): Promise<boolean> {
		if (!this.settings.appwriteEndpoint || !this.settings.appwriteApiKey) {
			new Notice("Instellingen niet compleet");
			return false;
		}

		try {
		} catch {}

		try {
			const data = await this.request<Models.DatabaseList>(
				"GET",
				"/databases",
			);

			if (data.databases) {
				new Notice(
					`Verbinding geslaagd! ${data.total} databases gevonden.`,
				);
				return true;
			}
			return false;
		} catch (e) {
			if (e) console.log(`Verbinding mislukt: ${e.toString()}`);
			return false;
		}
	}

	async listTeams(): Promise<Models.TeamList> {
		return await this.request("GET", `/teams`);
	}

	async getTeam(teamId: string): Promise<Models.Team> {
		return await this.request("GET", `/teams/${teamId}`);
	}

	async createTeam(teamId: string, name: string): Promise<Models.Team> {
		return await this.request("POST", `/teams`, {
			teamId: teamId,
			name: name,
		});
	}

	async listDatabases(): Promise<Models.DatabaseList> {
		return await this.request("GET", `/tablesdb/`);
	}

	async getDatabase(databaseId: string): Promise<Models.Database> {
		return await this.request("GET", `/tablesdb/${databaseId}`);
	}

	async createDatabase(
		databaseId: string,
		name: string,
	): Promise<Models.Database> {
		return await this.request<Models.Database>("POST", "/tablesdb", {
			databaseId: databaseId,
			name: name,
		});
	}

	async getTable(databaseId: string, tableId: string): Promise<Models.Table> {
		return await this.request(
			"GET",
			`/tablesdb/${databaseId}/tables/${tableId}`,
		);
	}

	async listTables(databaseId: string): Promise<Models.TableList> {
		return await this.request("GET", `/tablesdb/${databaseId}/tables`);
	}

	// TODO verder invullen. deze functie kan je pas uitvoeren als er een team is aangemaakt
	// Permissions any is niet handig
	async createTable(
		databaseId: string,
		tableId: string,
		name: string,
	): Promise<Models.Table> {
		return await this.request("POST", `/tablesdb/${databaseId}/tables`, {
			tableId: tableId,
			name: name,
			permissions: ['read("any")'],
			rowSecurity: false,
			enabled: false,
			columns: [],
			indexes: [],
		});
	}

	// DANGER ZONE

	async deleteDatabase(databaseId: string): Promise<void> {
		await this.request("DELETE", `/tablesdb/${databaseId}`);
	}
}
