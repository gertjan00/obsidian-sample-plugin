import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";
import { LoginModal } from "ui/LoginModal";

export interface MyPluginSettings {
	appwriteEndpoint: string;
	appwriteProjectId: string;
	appwriteApiKey: string;
	connected: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	appwriteEndpoint: "https://<REGION>.cloud.appwrite.io/v1",
	appwriteProjectId: "",
	appwriteApiKey: "",
	connected: false,
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
			.setName("Test verbinding met Appwrite")
			.setDesc(
				"Doet een count van je aantal databases in je project (zou 1 moeten zijn)",
			)
			.addButton((button) => {
				button
					.setButtonText("Test")
					.setCta()
					.onClick(async () => {
						await this.plugin.appwrite.testConnection();
					});
			});

		new Setting(containerEl)
			.setName("Update database schema")
			.setDesc("Werkt het schema bij in de database.")
			.addButton((button) => {
				button
					.setButtonText("Update")
					.setCta()
					.onClick(async () => {
						await this.updateDatabase();
					});
			});
	}

	async updateDatabase(): Promise<void> {
		await this.plugin.appwrite.prepareDatabase();
	}
}
