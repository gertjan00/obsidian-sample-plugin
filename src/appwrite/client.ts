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
	public createBucket;
	public testApiKey;
	public registerUser;

	constructor(settings: MyPluginSettings, app: App) {
		this.http = new AppwriteHttpService(settings, app.secretStorage);
		this.sync = new AppwriteSyncService(app.vault, this.http);

		this.createBucket = this.http.createBucket;
		this.createSchema = this.http.createSchema;
		this.testApiKey = this.http.testApiKey;
		this.registerUser = this.http.registerUser;

		this.pushAllFiles = this.sync.pushAllFiles;
		this.pullAllFiles = this.sync.pullAllFiles;
	}
}
