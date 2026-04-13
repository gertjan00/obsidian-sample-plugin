import { App, SecretStorage } from "obsidian";
import { MyPluginSettings } from "settings";
import { ObsidianAdminClient, ObsidianUserClient } from "./obsidian-clients";

export class AppwriteService {
	private admin: ObsidianAdminClient;
	private user: ObsidianUserClient;
	private secretStorage: SecretStorage;

	constructor(
		private settings: MyPluginSettings,
		app: App,
	) {
		this.admin = new ObsidianAdminClient();
		this.user = new ObsidianUserClient();
		this.secretStorage = app.secretStorage;
	}

	reconfigure() {
		this.user
			.setEndpoint(this.settings.appwriteEndpoint)
			.setProject(this.settings.appwriteProjectId);

		this.admin
			.setEndpoint(this.settings.appwriteEndpoint)
			.setProject(this.settings.appwriteProjectId);

		const apiKey = this.secretStorage.getSecret(
			this.settings.appwriteApiKey,
		);

		if (apiKey) {
			this.admin.setKey(apiKey);
		}
	}
}
