import { Plugin, requestUrl } from "obsidian";
import {
	MyPluginSettings,
	DEFAULT_SETTINGS,
	MyPluginSettingTab,
} from "./settings";
import { AppwriteService } from "appwrite/client";

export default class MyPlugin extends Plugin {
	public settings!: MyPluginSettings;
	public appwrite!: AppwriteService;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MyPluginSettingTab(this));
		this.appwrite = new AppwriteService(this.settings, this.app);
		this.appwrite.reconfigure();

		try {
			const res = await this.appwrite.user.account.get();
			console.log(res);
			this.settings.loggedIn = true;
		} catch (e: any) {
			this.settings.loggedIn = false;
			console.log(e?.message);
		} finally {
			this.saveSettings();
		}
		//
	}

	async onunload() {}

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
