import { Models } from "node-appwrite";
import { requestUrl, SecretStorage } from "obsidian";
import { MyPluginSettings } from "settings";
import { template } from "types/schema-template";
import { SyncLogger } from "types/sync-logger";

export class AppwriteHttpService {
	constructor(
		private settings: MyPluginSettings,
		private secretStorage: SecretStorage,
	) {}

	request = async <TResponse>(
		method: "GET" | "POST" | "DELETE",
		path: string,
		body?: unknown,
	): Promise<TResponse> => {
		try {
			const url = `${this.settings.appwriteEndpoint}${path}`;

			const res = await requestUrl({
				url: url,
				method: method,
				headers: {
					"Content-Type": "application/json",
					"X-Appwrite-Project": this.settings.appwriteProjectId,
					"X-Appwrite-Key":
						this.secretStorage.getSecret(
							this.settings.appwriteApiKey,
						) || "",
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			if (!res.text || res.text.trim() === "") {
				return undefined as TResponse;
			}

			return res.json as TResponse;
		} catch (e) {
			throw e;
		}
	};

	registerUser = async (email: string, password: string): Promise<any> => {
		return await this.request("POST", "/account", {
			userId: "unique()",
			email: email,
			password: password,
			name: email.split("@")[0],
		});
	};

	testApiKey = async (): Promise<boolean> => {
		try {
			await this.request("GET", "/health/queue/stats-usage");
		} catch (e: any) {
			return false;
		}
		return true;
	};

	createDatabase = async (
		databaseId: string,
		name: string,
	): Promise<Models.Database> => {
		return await this.request<Models.Database>("POST", "/tablesdb", {
			databaseId: databaseId,
			name: name,
		});
	};

	// TODO verder invullen. deze functie kan je pas uitvoeren als er een team is aangemaakt
	// Permissions any is niet handig
	createTable = async (
		databaseId: string,
		tableId: string,
		name: string,
	): Promise<Models.Table> => {
		return await this.request("POST", `/tablesdb/${databaseId}/tables`, {
			tableId: tableId,
			name: name,
			permissions: [],
			rowSecurity: false,
			enabled: false,
		});
	};

	createBucket = async (bucketId: string, name: string) => {
		const url = "/storage/buckets";

		try {
			await this.request("POST", url, { bucketId: bucketId, name: name });
		} catch (e: any) {
			if (e.status == 409) {
			} else {
				console.error(e);
			}
		}
	};

	createSchema = async (syncLogger?: SyncLogger): Promise<void> => {
		const log = syncLogger || (() => {});

		log("Creating bucket for binary files...");
		this.createBucket(
			template.buckets.first()!.bucketId,
			template.buckets.first()!.name,
		);

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
						await this.request("POST", url, body);
					} catch (e: any) {
						if (e.status == 404 || e.status == 409) {
							log(` - column '${column.key}' already exists.`, 6);
						} else {
							log(e, 6);
						}
					}
				}
			}
		}
	};

	// DANGER ZONE

	// Deze functie alleen tijdens testen gebruiken
	resetAll = async () => {
		console.info("Start reset alles");
		const dbList: Models.DatabaseList = await this.request(
			"GET",
			`/tablesdb/`,
		);

		dbList.databases.forEach(async (database) => {
			try {
				console.log(`"${database.name}" verwijderen`);
				await this.request("DELETE", `/tablesdb/${database.$id}`);
			} catch (e: any) {
				if (e) console.error(e);
			}
		});
	};
}
