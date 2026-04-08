import { App } from "obsidian";
import { MyPluginSettings } from "settings";
import { AppwriteHttpService } from "./services/http";
import { AppwriteSyncService } from "./services/sync";

export class AppwriteService {
	private http: AppwriteHttpService;
	private sync: AppwriteSyncService;

	public pushAllFiles;
	public pullAllFiles;
	public createSchema;

	constructor(settings: MyPluginSettings, app: App) {
		this.http = new AppwriteHttpService(settings);
		this.sync = new AppwriteSyncService(app.vault, this.http);

		this.createSchema = this.http.createSchema;
		this.pushAllFiles = this.sync.pushAllFiles;
		this.pullAllFiles = this.sync.pullAllFiles;
	}
}
