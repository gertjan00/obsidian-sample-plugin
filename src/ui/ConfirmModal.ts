import { App, Modal, Setting, ButtonComponent } from "obsidian";

interface ConfirmModalProps {
	title: string;
	message: string;
	onConfirm: () => void;
	countdown?: number;
	setWarning?: boolean;
}

export class ConfirmModal extends Modal {
	private timerId: number | null = null;
	private title: string;
	private message: string;
	private onConfirm: () => void;
	private countdown: number;
	private setWarning: boolean;

	constructor(app: App, props: ConfirmModalProps) {
		super(app);
		this.title = props.title;
		this.message = props.message;
		this.onConfirm = props.onConfirm;
		this.countdown = props.countdown ?? 0;
		this.setWarning = props.setWarning ?? false;
		console.log(props);
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
			.addButton((btn) => {
				btn.setButtonText(
					this.countdown > 0
						? `Wait ${this.countdown}...`
						: "Confirm",
				)
					.setDisabled(this.countdown > 0)
					.onClick(() => {
						this.onConfirm();
						this.close();
					});

				this.setWarning ? btn.setWarning() : btn.setCta();

				if (this.countdown > 0) {
					window.setInterval(() => {
						this.countdown -= 1;
						if (this.countdown > 0) {
							btn.setButtonText(`Wait ${this.countdown}...`);
						} else {
							if (this.timerId)
								window.clearInterval(this.timerId);
							btn.setDisabled(false);
							btn.setButtonText("Confirm");
						}
					}, 1000);
				}
			});
	}

	onClose() {
		this.contentEl.empty();
		if (this.timerId) window.clearInterval(this.timerId);
	}
}
