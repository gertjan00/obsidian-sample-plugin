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
		console.log("start onload()");
		await sleep(5000);
		await this.loadSettings();

		this.addSettingTab(new MyPluginSettingTab(this.app, this));
		this.appwrite = new AppwriteService(this.settings, this.app);
		this.appwrite.reconfigure();

		console.log(await this.appwrite.admin.tablesDB.list());

		console.log("start updateSchema()");
		await this.appwrite.admin.updateSchema();
		console.log("einde updateSchema()");

		await sleep(2000);
		console.log("Start pushAllFiles()");
		await this.appwrite.sync.pushAllFiles();
		console.log("Einde pushAllFiles()");
	}

	async onunload() {
		console.log("Start onunload()");
		await this.appwrite.admin.deleteAll();
		await sleep(2000);
		console.log("Einde onunload()");
	}

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
