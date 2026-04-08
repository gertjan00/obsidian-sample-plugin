import { Plugin } from "obsidian";
import {
	MyPluginSettings,
	DEFAULT_SETTINGS,
	MyPluginSettingTab,
} from "./settings";
import { AppwriteService } from "appwrite/client";
import { FirstSyncModal } from "ui/FirstSyncModal";
import { template } from "types/schema-template";

export default class MyPlugin extends Plugin {
	public settings!: MyPluginSettings;
	public appwrite!: AppwriteService;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new MyPluginSettingTab(this.app, this));
		this.appwrite = new AppwriteService(this.settings, this.app);

		if (false && !this.settings.initialSyncDone) {
			new FirstSyncModal(this.app, this.appwrite).open();
		}

		await this.appwrite.pullAllFiles("obsidian");

		navigator.clipboard.writeText(JSON.stringify(template, null, 2));
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
