import { App, Modal } from "obsidian";

interface DynamicModalProps {
	title: string;
	renderContent: (contentEl: HTMLElement, modal: Modal) => void;
	onSubmit?: () => void | Promise<void>;
}

export class DynamicModal extends Modal {
	constructor(
		app: App,
		private renderContent: (contentEl: HTMLElement) => {},
		private props: DynamicModalProps,
	) {
		super(app);
		this.setContent("Look at me, I'm a modal! 👀");
	}

	onOpen() {
		const contentEl = this.contentEl;

		this.renderContent(contentEl);
	}
}
