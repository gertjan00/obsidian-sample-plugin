import { Vault, TFile, Notice } from "obsidian";
import { AppwriteHttpService } from "./http";
import { SyncLogger } from "types/sync-logger";

export class AppwriteSyncService {
	constructor(
		private vault: Vault,
		private http: AppwriteHttpService,
	) {}

	async pushAllFiles(syncLogger?: SyncLogger) {
		const log = syncLogger || (() => {});
		const databaseId: string = "obsidian";
		const collectionId: string = "files";

		const files = this.vault
			.getFiles()
			.sort((a, b) => (a.path > b.path ? 1 : -1));

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
	}

	async pushFile(file: TFile, databaseId: string, collectionId: string) {
		const content = await this.vault.read(file);
		const stats = file.stat;

		const payload = {
			documentId: "unique()",
			data: {
				path: file.path,
				content: content,
				last_modified_by: "Obsidian_Client",
				last_modified_at: new Date(stats.mtime).toISOString(),
				checksum: stats.size.toString(),
			},
		};

		const url = `/databases/${databaseId}/collections/${collectionId}/documents`;
		return await this.http.request("POST", url, payload);
	}
}
