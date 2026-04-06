import { Models } from "node-appwrite";
import { App, Notice } from "obsidian";
import { MyPluginSettings } from "settings";
import { AppwriteHttpService } from "./services/http";
import { AppwriteSchemaService } from "./services/schema";
import { AppwriteSyncService } from "./services/sync";
import { FirstSyncModal } from "ui/FirstSyncModal";

export class AppwriteService {
	private settings: MyPluginSettings;

	public http: AppwriteHttpService;
	public schema: AppwriteSchemaService;
	public sync: AppwriteSyncService;

	constructor(settings: MyPluginSettings, app: App) {
		this.settings = settings;
		this.http = new AppwriteHttpService(settings);
		this.schema = new AppwriteSchemaService(this.http);
		this.sync = new AppwriteSyncService(app.vault, this.http);
	}

	async testConnection(): Promise<boolean> {
		if (!this.settings.appwriteEndpoint || !this.settings.appwriteApiKey) {
			new Notice("Instellingen niet compleet");
			return false;
		}

		try {
		} catch {}

		try {
			const data = await this.http.request<Models.DatabaseList>(
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
}
