import { App, Modal, Notice, Setting } from "obsidian";

export class LoginModal extends Modal {
	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.setTitle("Log in met je Appwrite account");

		new Setting(this.contentEl).setName("Gebruiker:").addText((text) => {
			text.onChange((value) => {
				new Notice(value);
			});
		});

		new Setting(this.contentEl).setName("Wachtwoord").addText((text) => {
			text.onChange((value) => {
				new Notice(value);
			});
		});

		let test = "test123";

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					onSubmit(test);
				}),
		);
	}
}
