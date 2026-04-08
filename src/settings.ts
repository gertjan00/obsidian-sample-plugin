import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";
import { FirstSyncModal } from "ui/FirstSyncModal";
import { ConfirmModal } from "ui/ConfirmModal";

export interface MyPluginSettings {
	appwriteEndpoint: string;
	appwriteProjectId: string;
	appwriteApiKey: string;
	connected: boolean;
	initialSyncDone: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	appwriteEndpoint: "https://<REGION>.cloud.appwrite.io/v1",
	appwriteProjectId: "",
	appwriteApiKey: "",
	connected: false,
	initialSyncDone: false,
};

export class MyPluginSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Appwrite Obsidian Sync settings" });

		new Setting(containerEl)
			.setName("Appwrite endpoint")
			.setDesc("The url where your Appwrite project can be reached")
			.addText((text) => {
				text.inputEl.style.width = "250px";

				text.setPlaceholder(DEFAULT_SETTINGS.appwriteEndpoint)
					.setValue(this.plugin.settings.appwriteEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.appwriteEndpoint = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName("Appwrite project id")
			.setDesc("The id of your Appwrite project")
			.addText((text) => {
				text.inputEl.style.width = "250px";

				text.setPlaceholder(DEFAULT_SETTINGS.appwriteProjectId)
					.setValue(this.plugin.settings.appwriteProjectId)
					.onChange(async (value) => {
						this.plugin.settings.appwriteProjectId = value;
						await this.plugin.saveSettings();
					});
			});

		// API key can be saved in data.json. Each user needs to setup their own private appwrite project.
		// So environment will not be shared with others and apikey only accessible on client machine.
		// If someone can access that then apikey is not biggest concern
		// Maybe later: only store key in memory during initial setup.
		new Setting(containerEl)
			.setName("Appwrite API key")
			.setDesc("Your server API key")
			.addText((text) => {
				text.inputEl.style.width = "250px";
				text.inputEl.type = "password";

				text.setPlaceholder(DEFAULT_SETTINGS.appwriteApiKey)
					.setValue(this.plugin.settings.appwriteApiKey)
					.onChange(async (value) => {
						this.plugin.settings.appwriteApiKey = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Update database schema")
			.setDesc("Werkt het schema bij in de database.")
			.addButton((button) => {
				button
					.setButtonText("Update")
					.setCta()
					.onClick(async () => {});
			});

		new Setting(containerEl)
			.setName("Run first sync")
			.setDesc(
				"Choose if you want to pull from, or push to the server (merge not yet available)",
			)
			.addButton((button) => {
				button
					.setCta()
					.setButtonText("Sync")
					.onClick(() => {});
			});

		new Setting(containerEl)
			.setName("Reset appwrite")
			.setDesc("This will delete ALL data in Appwrite!")
			.addButton((button) => {
				button
					.setButtonText("delete")
					.setWarning()
					.onClick(() => {
						new ConfirmModal(this.app, {
							title: "Are you really, really sure?",
							message:
								"This will really delete all data on your Appwrite server!!",
							countdown: 10,
							setWarning: true,
							onConfirm: async () => {},
						}).open();
					});
			});
	}
}
