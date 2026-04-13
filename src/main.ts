import { Plugin, requestUrl } from "obsidian";
import {
	MyPluginSettings,
	DEFAULT_SETTINGS,
	MyPluginSettingTab,
} from "./settings";
import { AppwriteService } from "appwrite/client";
import { ObsidianUserClient } from "appwrite/obsidian-clients";
import { Account } from "appwrite";

export default class MyPlugin extends Plugin {
	public settings!: MyPluginSettings;
	public appwrite!: AppwriteService;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new MyPluginSettingTab(this.app, this));
		this.appwrite = new AppwriteService(this.settings, this.app);

		const client = new ObsidianUserClient()
			.setEndpoint(this.settings.appwriteEndpoint)
			.setProject(this.settings.appwriteProjectId);

		const account = new Account(client);

		const user = account.createEmailPasswordSession({
			email: "1234@test.nl",
			password: "12345678",
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
