import { App, Modal, Setting, Notice, ButtonComponent } from "obsidian";
import { AppwriteService } from "appwrite/client";
import { AppwriteException, Models } from "appwrite";

export class LoginModal extends Modal {
	private email = "";
	private password = "";
	private loginButton!: ButtonComponent;

	constructor(
		app: App,
		private appwrite: AppwriteService,
		private onSuccess: (session: Models.Session) => void,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		this.setTitle("Login to existing workspace");

		contentEl.createEl("p", {
			text: "Log in met je Appwrite account om deze Obsidian client te koppelen aan je workspace.",
		});

		new Setting(contentEl).setName("Email").addText((text) => {
			text.inputEl.addClass("aos-wide-input");
			text.setPlaceholder("email@example.com")
				.setValue(this.email)
				.onChange((value) => {
					this.email = value.trim();
					this.validate();
				});
		});

		new Setting(contentEl).setName("Password").addText((text) => {
			text.inputEl.type = "password";
			text.setPlaceholder("Password")
				.setValue(this.password)
				.onChange((value) => {
					this.password = value;
					this.validate();
				});
		});

		new Setting(contentEl).addButton((btn) => {
			this.loginButton = btn;

			btn.buttonEl.style.width = "250px";
			btn.setButtonText("Login")
				.setCta()
				.onClick(async () => {
					btn.setDisabled(true);

					try {
						const session =
							await this.appwrite.user.account.createEmailPasswordSession(
								{
									email: this.email,
									password: this.password,
								},
							);

						new Notice("Succesvol ingelogd");
						this.close();
						this.onSuccess(session);
					} catch (e) {
						if (e instanceof AppwriteException) {
							new Notice(e.message);
						} else {
							new Notice("Login failed");
							console.error(e);
						}
					} finally {
						btn.setDisabled(false);
					}
				});
		});

		this.validate();
	}

	private validate(): void {
		if (!this.loginButton) return;

		const errors: string[] = [];

		if (this.email === "") {
			errors.push("Email is required");
		} else if (!this.email.includes("@") || !this.email.includes(".")) {
			errors.push("Please enter a valid email address");
		}

		if (this.password.length < 8) {
			errors.push("Password must be at least 8 characters");
		}

		if (errors.length > 0) {
			this.loginButton
				.setDisabled(true)
				.setTooltip(errors.join("\n"), { delay: -1 });
		} else {
			this.loginButton.setDisabled(false).setTooltip("");
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
