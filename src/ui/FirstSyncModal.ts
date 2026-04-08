// FirstSyncModal.ts
import { AppwriteSchemaService } from "appwrite/services/schema";
import { AppwriteSyncService } from "appwrite/services/sync";
import { App, ButtonComponent, Modal, Notice, Setting } from "obsidian";
import { SyncLogger } from "types/sync-logger";

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
						buttonEl.disabled = true;
						buttonEl.innerText = "Syncing...";

						const terminalWrapper = contentEl.createEl("div", {
							attr: {
								style: "position: relative; margin-top: 20px;",
							},
						});

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

						const syncLogger: SyncLogger = (
							msg: string,
							indentation: number = 0,
							color: string = "#d1d1d1",
						) => {
							terminal.createEl("div", {
								attr: {
									style: `
											color: ${color}; 
											margin: 0; 
											white-space: pre-wrap; 
											padding-left: ${indentation * 8}px;
											border-left: ${indentation > 0 ? "1px solid #" : "none"};
											margin-bottom: 2px;
										`,
								},
								text:
									(indentation === 0
										? "> "
										: " ".repeat(indentation)) + msg,
							});
							terminal.scrollTop = terminal.scrollHeight;
							console.log(msg);
						};

						const copyBtn = terminalWrapper.createEl("button", {
							text: "Copy",
							cls: "button",
							attr: {
								style: "position: absolute; top: 8px; right: 8px; cursor: pointer; opacity: 0.8",
							},
						});
						copyBtn.onClickEvent(() => {
							navigator.clipboard.writeText(terminal.innerText);
							new Notice("Logs copied to clipboard");
						});

						// await this.schema.updateSchema(logger);
						await this.schema.createSchema(syncLogger);
						await this.sync.pushAllFiles(syncLogger);

						buttonEl.remove();
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
