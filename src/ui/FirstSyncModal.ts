// FirstSyncModal.ts
import { App, ButtonComponent, Modal, Notice, Setting } from "obsidian";

type SyncDirection = "pull" | "push";

export class FirstSyncModal extends Modal {
	private onSubmit: (result: SyncDirection) => void;
	private currentDirection: SyncDirection = "pull";

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		this.setTitle("Initial Appwrite Sync");

		new Setting(contentEl)
			.setName("Synchronization direction")
			.setDesc(
				"Choose whether to pull data from the server or push your local vault to the server.",
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("pull", "Pull from Server")
					.addOption("push", "Push to Server")
					.setValue(this.currentDirection)
					.onChange((value: SyncDirection) => {
						this.currentDirection = value;
					});
			});

		new Setting(contentEl).addButton((button) => {
			button
				.setCta()
				.setButtonText("Sync")
				.onClick(() => {
					this.close();
					this.onSubmit(this.currentDirection);
				});
		});
	}
}
