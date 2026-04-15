import { Vault, TFile, Notice } from "obsidian";
import { SyncLogger } from "types/sync-logger";
import { Query } from "node-appwrite";
import { databases, DatabaseTables } from "generated/appwrite";

export class AppwriteSyncService {
	constructor(
		private vault: Vault,
		private databases: DatabaseTables,
	) {}

	pushAllFiles = async (syncLogger?: SyncLogger) => {
		const log =
			syncLogger ||
			((message) => {
				console.log(message);
			});

		const files = this.vault
			.getFiles()
			.sort((a, b) => (a.path > b.path ? 1 : -1));

		log("");
		log("Start uploading files...", 0);
		log(`${files.length} files found locally.`, 0);

		await sleep(1000);

		let i = 1;
		for (const file of files) {
			try {
				await this.pushFile(file);
				log(`uploaded (${i}/${files.length}) '${file.path}'`, 2);
			} catch (e) {
				log(
					`uploading failed for (${i}/${files.length}) '${file.path}'`,
					4,
					"red",
				);
			} finally {
				i++;
			}
		}
	};

	pushFile = async (file: TFile) => {
		const filesTable = this.databases.use("obsidian").use("files");

		await filesTable.create({
			path: file.path,
			content: await this.vault.read(file),
			checksum: "3",
			last_modified_by: "obsidian client",
			last_modified_at: new Date(file.stat.mtime).toISOString(),
		});

		return;
	};

	pullAllFiles = async () => {
		new Notice("Pulling files...");
		const url = `/tablesdb/obsidian/tables/files/rows?total=${false}&queries[]=${[Query.limit(999999999)]}`;

		const files: any = {};

		for (const file of files.rows) {
			this.pullFile(file);
		}

		new Notice("Pull files finished");
		return files;
	};

	pullFile = async (file: any) => {
		const parentFolders = file.path.split("/").slice(0, -1);

		// Create parent folders
		let currentPath = "";
		for (const folder of parentFolders) {
			try {
				await this.vault.createFolder(`${currentPath}/${folder}`);
			} catch {}
			currentPath += `/${folder}`;
		}

		// Create file
		try {
			await this.vault.create(file.path, file.content);
		} catch {}
	};
}
