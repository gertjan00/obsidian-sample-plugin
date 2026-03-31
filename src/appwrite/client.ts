import { requestUrl, RequestUrlParam, Notice } from "obsidian";
import { MyPluginSettings } from "settings";
import { AppwriteAPI } from "types/appwrite-api";

export class AppwriteService {
	private settings: MyPluginSettings;

	constructor(settings: MyPluginSettings) {
		this.settings = settings;
	}

	private async adminRequest<
		P extends keyof AppwriteAPI,
		M extends keyof AppwriteAPI[P] & string,
	>(
		path: P,
		method: M,
		body?: AppwriteAPI[P][M] extends { body: infer B } ? B : undefined,
	): Promise<AppwriteAPI[P][M] extends { response: infer R } ? R : any> {
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

			return res.json;
		} catch (e) {
			let msg;

			if (e instanceof Error) {
				msg = e.message;
			} else if (e) {
				msg = e.toString();
			} else {
				msg = "Onbekende fout";
			}

			throw new Error(
				`Appwrite adminRequest error op ${method} - ${path}: ${msg}`,
			);
		}
	}

	async testConnection(): Promise<boolean> {
		if (!this.settings.appwriteEndpoint || !this.settings.appwriteApiKey) {
			new Notice("Instellingen niet compleet");
			return false;
		}

		try {
			const data = await this.adminRequest("/databases", "GET");

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

	async initialSync(): Promise<void> {}

	async prepareDatabase(): Promise<void> {
		try {
			await this.adminRequest("/databases", "POST", {
				databaseId: "test",
				name: "test",
			});
			new Notice("Database 'test' aangemaakt.");
		} catch (e) {
			new Notice("Database aanmaken mislukt.");
		}
	}
}
