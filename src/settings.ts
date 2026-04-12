import {
	App,
	SecretComponent,
	PluginSettingTab,
	Setting,
	setIcon,
	ButtonComponent,
	Notice,
	SecretStorage,
} from "obsidian";
import MyPlugin from "./main";
import { FirstSyncModal } from "ui/FirstSyncModal";
import { ConfirmModal } from "ui/ConfirmModal";
import { Account, Client } from "appwrite";
import { DynamicModal } from "ui/DynamicModal";
import { RegisterModal } from "ui/RegisterModal";

interface Tab {
	id: string;
	title: string;
	icon: string;
	requiresApiKey: boolean;
	render: (containerEl: HTMLElement) => void;
}

export interface MyPluginSettings {
	appwriteEndpoint: string;
	appwriteProjectId: string;
	appwriteApiKey: string;

	onboardingCompleted: boolean;
	deviceId: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	appwriteEndpoint: "https://appwrite.zalmhuys.com/v1", // "https://<REGION>.cloud.appwrite.io/v1",
	appwriteProjectId: "69c315ee003c738bed8e", // ""
	appwriteApiKey: "",

	onboardingCompleted: false,
	deviceId: "",
};

export class MyPluginSettingTab extends PluginSettingTab {
	plugin: MyPlugin;
	private currentActiveTab: string;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.currentActiveTab = "team";
	}

	display(): void {
		const containerEl = this.containerEl;
		containerEl.empty();
		containerEl.addClass("aos-settings-tab");

		containerEl.createEl("h2", {
			text: "Appwrite Obsidian Sync Settings",
			attr: {
				style: "padding-left: 0",
			},
		});

		// Onboarding
		if (!this.plugin.settings.onboardingCompleted) {
			const validateSettings = (): void => {
				const errors: string[] = [];

				const { appwriteEndpoint, appwriteProjectId, appwriteApiKey } =
					this.plugin.settings;

				if (
					appwriteEndpoint.trim() == "" ||
					appwriteProjectId.trim() == ""
				) {
					errors.push("Please provide your endpoint and project id");
				}

				if (!appwriteEndpoint.startsWith("https")) {
					errors.push("Endpoint must start with 'https'");
				}

				if (!appwriteEndpoint.toLowerCase().trim().endsWith("/v1")) {
					errors.push("Endpoint must end with '/v1'");
				}

				try {
					new URL(appwriteEndpoint);
				} catch {
					errors.push("Endpoint is not a valid url");
				}

				// set login button
				if (errors.length > 0) {
					loginButton
						.setDisabled(true)
						.setTooltip(errors.join("\n"), {
							delay: -1,
						});
				} else {
					loginButton.setDisabled(false).setTooltip("");
				}

				const apiKey =
					this.plugin.app.secretStorage.getSecret(appwriteApiKey);
				if (!apiKey) {
					errors.push("API key is required");
				}

				const apiKeyValid = (async () => {
					await this.plugin.appwrite.testApiKey();
				})();
				if (apiKey && !apiKeyValid) {
					errors.push(
						"API key is not valid or does not have the required scopes",
					);
				}

				// set create workspace button
				if (errors.length > 0) {
					createWorkspaceButton
						.setDisabled(true)
						.setTooltip(errors.join("\n"), {
							delay: -1,
						});
				} else {
					createWorkspaceButton
						.setDisabled(false)
						.setTooltip(errors.join(""));
				}
			};

			new Setting(containerEl)
				.setName("Appwrite Endpoint")
				.setDesc(
					"The url to reach your Appwrite project (should end with /v1).",
				)
				.addText((input) => {
					input.inputEl.addClass("aos-wide-input");
					input
						.setValue(this.plugin.settings.appwriteEndpoint)
						.onChange((value) => {
							this.plugin.settings.appwriteEndpoint = value;
							this.plugin.saveSettings();
							validateSettings();
						});
				});

			new Setting(containerEl)
				.setName("Appwrite Project")
				.setDesc(
					"The id of your Appwrite project. Default is 20 characters",
				)
				.addText((input) => {
					input.inputEl.addClass("aos-wide-input");
					input
						.setValue(this.plugin.settings.appwriteProjectId)
						.onChange(async (value) => {
							this.plugin.settings.appwriteProjectId = value;
							await this.plugin.saveSettings();
							validateSettings();
						});
				});

			let loginButton: ButtonComponent;
			new Setting(containerEl)
				.setName("Login to existing workspace.")
				.setDesc("Requires an invitelink")
				.addButton((b) => {
					loginButton = b;

					b.setCta()
						.setButtonText("Login")
						.onClick(async () => {
							new Notice(this.plugin.settings.appwriteEndpoint);
							new Notice(this.plugin.settings.appwriteProjectId);
							const { appwriteEndpoint, appwriteProjectId } =
								this.plugin.settings;

							const client = new Client()
								.setEndpoint(appwriteEndpoint)
								.setProject(appwriteProjectId);

							const account = new Account(client);
						});
				});

			new Setting(containerEl)
				.setHeading()
				.setName("If this is your first device:");

			new Setting(containerEl)
				.setName("Appwrite API key")
				.setDesc(
					"Will be stored securely on your device. Needed for initial setup and advanced features.",
				)
				.addComponent((el) =>
					new SecretComponent(this.app, el)
						.setValue(this.plugin.settings.appwriteApiKey)
						.onChange(async (value) => {
							this.plugin.settings.appwriteApiKey = value;
							await this.plugin.saveSettings();

							let connected: boolean = false;
							if (value) {
								connected =
									await this.plugin.appwrite.testApiKey();
								new Notice(
									`Api key ${!connected ? "is not " : "is"} valid!`,
								);
							}

							new Notice(
								`Advanced features are now ${value && connected ? "enabled" : "disabled"}.`,
							);

							this.display();
						}),
				);

			let createWorkspaceButton: ButtonComponent;
			new Setting(containerEl)
				.setName("Create a new workspace.")
				.setDesc(
					"Requires an API key of your Appwrite project with permissions for Auth, Database and Storage ",
				)
				.addButton((b) => {
					createWorkspaceButton = b;
					b.setWarning()
						.setButtonText("Create")
						.onClick(() => {
							new RegisterModal(
								this.app,
								this.plugin.appwrite,
								() => {
									new Notice("Start database inrichten...");
								},
							).open();
						});
				});

			validateSettings();
			return;
		}

		// Main
		const headerEl = containerEl.createDiv({
			cls: "tab-header",
		});

		const tabs = this.getTabs();

		tabs.forEach((tab) => {
			const isActive = tab.id === this.currentActiveTab;

			const isDisabled =
				tab.requiresApiKey && !this.plugin.settings.appwriteApiKey;

			const btn = new ButtonComponent(headerEl)
				.setIcon(tab.icon)
				.setDisabled(isDisabled)
				.setTooltip(isDisabled ? "API key required" : "", {
					delay: -1,
				})
				.onClick(() => {
					this.currentActiveTab = tab.id;
					this.display();
				});

			btn.buttonEl.createSpan({
				text: tab.title,
			});

			if (isActive) {
				btn.setCta();
				tab.render(containerEl);
			}
		});
	}

	private getTabs(): Tab[] {
		const tabs = [
			{
				id: "general",
				title: "Algemeen",
				icon: "settings",
				requiresApiKey: false,
				render: (containerEl: HTMLElement) => {
					this.renderGeneralSettings(containerEl);
				},
			},
			{
				id: "preferences",
				title: "Voorkeuren",
				icon: "settings-2",
				requiresApiKey: true,
				render: (containerEl: HTMLElement) => {
					this.renderPreferenceSettings(containerEl);
				},
			},
			{
				id: "team",
				title: "Team",
				icon: "users",
				requiresApiKey: true,
				render: (containerEl: HTMLElement) => {
					this.renderTeamSettings(containerEl);
				},
			},
			{
				id: "advanced",
				title: "Geavanceerd",
				icon: "wrench",
				requiresApiKey: true,
				render: (containerEl: HTMLElement) => {
					this.renderAdvancedSettings(containerEl);
				},
			},
		];

		return tabs;
	}

	private renderGeneralSettings(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Unlock advanced features")
			.setHeading();
	}

	private renderPreferenceSettings(containerEl: HTMLElement) {
		containerEl.createEl("p", {
			text: "These settings are shared accross users and devices.",
		});
	}

	private renderTeamSettings(containerEl: HTMLElement) {
		const columns = [
			{ key: "name", caption: "Name" },
			{ key: "joinedAt", caption: "Joined at" },
			{ key: "status", caption: "Status" },
			{ key: "last_seen", caption: "Last seen" },
			{ key: "devices", caption: "Devices" },
		];
		const rows = [
			{ name: "Gert Jan", joined_at: "Today", status: "Verified" },
			{ name: "Pieter", joined_at: "Today", status: "Verified" },
			{ name: "Evert", joined_at: "Today", status: "Verified" },
			{ name: "Tromp", joined_at: "Today", status: "Verified" },
		];

		const table = containerEl.createEl("table", {
			cls: "aos-settings-table",
		});

		const tbody = table.createEl("tbody");

		for (const row of rows) {
			// const tr = tbody.createEl("tr");
			// for (const column of columns) {
			// 	tr.createEl("td", {
			// 		text: row[column.key] || "",
			// 	});
			// }
			// tr.createEl("td", {
			// 	text: row.name,
			// });
			// tr.createEl("td", {
			// 	text: row.joined_at,
			// });
			// tr.createEl("td", {
			// 	text: row.status,
			// });
		}
	}

	private renderAdvancedSettings(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Reset settings")
			.addButton((button) => {
				button
					.setButtonText("Reset")
					.setWarning()
					.onClick(() => {
						this.plugin.settings = DEFAULT_SETTINGS;
						this.plugin.saveSettings();
						this.currentActiveTab = "general";
						this.display();
						new Notice(
							"Settings set back to default settings",
							5000,
						);
					});
			});
	}
}
