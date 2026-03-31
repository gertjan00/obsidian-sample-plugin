import { requestUrl, RequestUrlParam, Notice } from "obsidian";
import { MyPluginSettings } from "settings";

export class AppwriteService {
	private settings: MyPluginSettings;

	constructor(settings: MyPluginSettings) {
		this.settings = settings;
	}

	private async adminRequest(method: string, path: string, body?: any) {
		const url = `${this.settings.appwriteEndpoint}${path}`;

		const params: RequestUrlParam = {
			url: url,
			method: method,
			headers: {
				"Content-Type": "application/json",
				"X-Appwrite-Project": this.settings.appwriteProjectId,
				"X-Appwrite-Key": this.settings.appwriteApiKey,
			},
			body: body ? JSON.stringify(body) : undefined,
		};

		try {
			const response = await requestUrl(params);
			return response.json;
		} catch (error) {
			console.error("Appwrite Admin Request Error:", error);
			new Notice("error.toString()");
			throw error;
		}
	}

	async testConnection(): Promise<boolean> {
		if (!this.settings.appwriteEndpoint || !this.settings.appwriteApiKey) {
			new Notice("Instellingen niet compleet");
			return false;
		}

		try {
			const data = await this.adminRequest("GET", "/databases");

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
			await this.adminRequest("POST", "/databases", {
				databaseId: "test",
				name: "test",
			});
			new Notice("Database 'test' aangemaakt.");
		} catch (e) {
			new Notice("Database aanmaken mislukt.");
		}
	}
}
