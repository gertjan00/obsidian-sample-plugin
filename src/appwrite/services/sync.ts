import { Vault, TFile } from "obsidian";
import { AppwriteHttpService } from "./http";
import { SyncLogger } from "types/sync-logger";

export class AppwriteSyncService {
	constructor(
		private vault: Vault,
		private http: AppwriteHttpService,
	) {}

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
		return await this.http.request("POST", url, payload);
	};

	pullAllFiles = async ($id: string) => {
		const url = `/tablesdb/obsidian/tables/files`;
		const files = await this.http.request("GET", url);
		console.log(files);
	};
}
