// FirstSyncModal.ts
import { AppwriteSchemaService } from "appwrite/services/schema";
import { AppwriteSyncService } from "appwrite/services/sync";
import { App, ButtonComponent, Modal, Notice, Setting } from "obsidian";

export class FirstSyncModal extends Modal {
	constructor(
		app: App,
		private schema: AppwriteSchemaService,
		private sync: AppwriteSyncService,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		this.setTitle("Initial Appwrite Sync");

		new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText("Start")
					.setCta()
					.onClick(async (evt) => {
						const buttonEl = evt.currentTarget as HTMLButtonElement;
						buttonEl.disabled = true; // Voorkom dubbelklikken
						buttonEl.innerText = "Syncing...";

						// 1. Container voor de terminal (nodig voor de absolute positionering van de kopieerknop)
						const terminalWrapper = contentEl.createEl("div", {
							attr: {
								style: "position: relative; margin-top: 20px;",
							},
						});

						// 2. De Terminal zelf
						const terminal = terminalWrapper.createEl("div", {
							attr: {
								style: `
									height: 250px; 
									background-color: #0f0f0f; 
									color: #d1d1d1;
									font-family: var(--font-monospace); 
									font-size: 0.85em;
									line-height: 1.4;
									padding: 12px; 
									overflow-y: auto; 
									border-radius: 6px;
									border: 1px solid var(--background-modifier-border);
									box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
								`,
							},
						});

						// 3. De Kopieer-knop (altijd zichtbaar rechtsboven)
						const copyBtn = terminalWrapper.createEl("button", {
							text: "Copy Logs",
							attr: {
								style: "position: absolute; top: 8px; right: 8px; font-size: 0.7em; padding: 2px 8px; opacity: 0.6;",
							},
						});
						copyBtn.onClickEvent(() => {
							navigator.clipboard.writeText(terminal.innerText);
							new Notice("Logs copied to clipboard");
						});

						// Start de actie
						await this.schema.updateSchema(terminal);

						buttonEl.innerText = "Sync Finished";
					});
			})
			.addButton((button) => {
				button
					.setCta()
					.setButtonText("Close")
					.onClick(() => {
						this.close();
					});
			});
	}
}
