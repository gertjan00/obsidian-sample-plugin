import { App, Modal, Setting, ButtonComponent } from "obsidian";

export class ConfirmModal extends Modal {
	private onConfirm: () => void;
	private message: string;
	private title: string;

	constructor(
		app: App,
		title: string,
		message: string,
		onConfirm: () => void,
	) {
		super(app);
		this.title = title;
		this.message = message;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl, modalEl } = this;

		modalEl.addClass("mod-confirmation");

		this.setTitle(this.title);

		contentEl.createEl("p", { text: this.message });

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => this.close()),
			)
			.addButton((btn) =>
				btn
					.setButtonText("Confirm")
					.setCta()
					.onClick(() => {
						this.onConfirm();
						this.close();
					}),
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
