import { App, Modal, Setting } from "obsidian";

interface DynamicModalProps {
	title: string;
	renderContent: (contentEl: HTMLElement, modal: Modal) => void;
	onSubmit?: () => void | Promise<void>;
}

export class DynamicModal extends Modal {
	constructor(
		app: App,
		private props: DynamicModalProps,
	) {
		super(app);
		this.setTitle(this.props.title);
	}

	onOpen() {
		const contentEl = this.contentEl;
		const onSubmit = this.props.onSubmit;

		this.props.renderContent(contentEl, this);

		if (onSubmit) {
			new Setting(contentEl).addButton((b) => {
				b.onClick(async () => {
					b.setDisabled(true);

					await onSubmit();
					this.close();
				});
			});
		}
	}
}
