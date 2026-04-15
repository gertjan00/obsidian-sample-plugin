import { App, SecretStorage } from "obsidian";
import { MyPluginSettings } from "settings";
import { ObsidianAdminClient, ObsidianUserClient } from "./obsidian-clients";
import { AppwriteAdminService } from "./services/admin";
import { AppwriteUserService } from "./services/user";
import { AppwriteSyncService } from "./services/sync";

export class AppwriteService {
	private userClient: ObsidianUserClient;
	private adminClient: ObsidianAdminClient;
	private secretStorage: SecretStorage;

	public admin: AppwriteAdminService;
	public user: AppwriteUserService;
	public sync: AppwriteSyncService;

	constructor(
		private settings: MyPluginSettings,
		app: App,
	) {
		this.secretStorage = app.secretStorage;

		this.userClient = new ObsidianUserClient();
		this.user = new AppwriteUserService(this.userClient);

		this.adminClient = new ObsidianAdminClient();
		this.admin = new AppwriteAdminService(this.adminClient);

		this.sync = new AppwriteSyncService(app.vault, this.admin.databases);
	}

	reconfigure() {
		this.userClient
			.setEndpoint(this.settings.appwriteEndpoint)
			.setProject(this.settings.appwriteProjectId);

		this.adminClient
			.setEndpoint(this.settings.appwriteEndpoint)
			.setProject(this.settings.appwriteProjectId);

		const apiKey = this.secretStorage.getSecret(
			this.settings.appwriteApiKey,
		);

		if (apiKey) {
			this.adminClient.setKey(apiKey);
		}
	}
}
