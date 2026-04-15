import { Vault, TFile, Notice } from "obsidian";
import { SyncLogger } from "types/sync-logger";
import { Query } from "node-appwrite";

export class AppwriteSyncService {
	constructor(private vault: Vault) {}

	pushAllFiles = async (syncLogger?: SyncLogger) => {
		const log = syncLogger || (() => {});
		const databaseId: string = "obsidian";
		const collectionId: string = "files";

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
				await this.pushFile(file, databaseId, collectionId);
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

	pushFile = async (
		file: TFile,
		databaseId: string,
		collectionId: string,
	) => {
		const isBinary = ["md", "canvas", "txt"].includes(file.extension);

		if (isBinary) {
			const arrayBuffer = await this.vault.readBinary(file);
			const blob = new Blob([arrayBuffer]);
			const appwriteFile = new File([blob], file.name);
		}

		const content = await this.vault.read(file);
		const stats = file.stat;

		const payload = {
			rowId: "unique()",
			data: {
				path: file.path,
				content: content,
				last_modified_by: "Obsidian_Client",
				last_modified_at: new Date(stats.mtime).toISOString(),
				checksum: stats.size.toString(),
			},
		};

		const url = `/tablesdb/${databaseId}/tables/${collectionId}/rows`;
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
