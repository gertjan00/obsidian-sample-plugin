import { ObsidianAdminClient } from "appwrite/obsidian-clients";
import { AppwriteException, Models, Storage, TablesDB } from "node-appwrite";
import { template } from "types/schema-template";
import { SyncLogger } from "types/sync-logger";
import { never } from "utils";

type TDatabases = typeof template.databases;
type TDatabaseId = TDatabases[number]["id"];

type TTables<D extends TDatabaseId> = Extract<
	TDatabases[number],
	{ id: D }
>["tables"];
type TTableId<D extends TDatabaseId> = TTables<D>[number]["id"];

type TColumns<D extends TDatabaseId, T extends TTableId<D>> = Extract<
	TTables<D>[number],
	{ id: T }
>["columns"];

interface createColumnProps<D extends TDatabaseId, T extends TTableId<D>> {
	databaseId: TDatabaseId;
	tableId: TTableId<D>;
	column: TColumns<D, T>[number];
}

export class AppwriteAdminService {
	public tablesDB: TablesDB;
	public storage: Storage;

	constructor(adminClient: ObsidianAdminClient) {
		this.tablesDB = new TablesDB(adminClient);
		this.storage = new Storage(adminClient);
	}

	updateSchema = async (syncLogger?: SyncLogger): Promise<void> => {
		const { tablesDB, storage } = this;
		const log = syncLogger || (() => {});

		log("Creating bucket for binary files...");

		for (const bucket of template.buckets) {
			try {
				await storage.createBucket({
					bucketId: bucket.bucketId,
					name: bucket.name,
				});
			} catch (e: any) {
				if (e instanceof AppwriteException) {
					console.error(
						"Error while creating bucket",
						e.code,
						e.message,
					);
				}
			}
		}

		log("Database resetten", 0);
		await sleep(1000);

		log("Starting setup database", 0);

		for (const db of template.databases) {
			try {
				log(` - creating database '${db.id}'`, 0);

				try {
					await tablesDB.create({
						databaseId: db.id,
						name: db.name,
					});
				} catch (e: any) {
					if (e instanceof AppwriteException) {
						console.error(
							"Error while creating database",
							e.code,
							e.message,
						);
					}
				}
			} catch (e: any) {
				if (e.status == 404 || e.status == 409) {
					log(` - database '${db.id}' already exists.`, 2);
				} else {
					console.error(e);
				}
			}

			for (const table of db.tables) {
				try {
					log(` - creating table '${table.id}'`, 2);

					try {
						await tablesDB.createTable({
							databaseId: db.id,
							tableId: table.id,
							name: table.id,
						});
					} catch (e: any) {
						if (e instanceof AppwriteException) {
							console.error(
								"Error while creating table",
								e.code,
								e.message,
							);
						}
					}
				} catch (e: any) {
					if (e.status == 404 || e.status == 409) {
						log(` - table '${table.id}' already exists.`, 4);
					} else {
						log(e, 4);
					}
				}

				for (const column of table.columns) {
					try {
						log(
							` - creating column '${column.key}' (${column.type})`,
							4,
						);

						try {
							await this.createColumn({
								databaseId: db.id,
								tableId: table.id,
								column: column,
							});
						} catch (e: any) {
							if (e instanceof AppwriteException) {
								console.error(
									"Error while creating column",
									e.code,
									e.message,
								);
							}
						}
					} catch (e: any) {
						if (e.status == 404 || e.status == 409) {
							log(` - column '${column.key}' already exists.`, 6);
						} else {
							log(e, 6);
						}
					}
				}
			}
		}
	};

	async createColumn<D extends TDatabaseId, T extends TTableId<D>>(
		props: createColumnProps<D, T>,
	) {
		const { tablesDB } = this;
		const { databaseId, tableId } = props;
		const column = props.column;

		const { type, ...rest } = column;

		const payload: any = {
			databaseId: databaseId,
			tableId: tableId,
			...rest,
		};

		switch (type) {
			case "datetime":
				await tablesDB.createDatetimeColumn(payload);
				break;

			case "integer":
				await tablesDB.createIntegerColumn(payload);
				break;

			case "varchar":
				await tablesDB.createVarcharColumn(payload);
				break;

			case "text":
				await tablesDB.createTextColumn(payload);
				break;

			case "longtext":
				await tablesDB.createLongtextColumn(payload);
				break;

			default:
				never(type);
		}
	}

	async deleteAll() {
		const { tablesDB, storage } = this;

		const databases = (await tablesDB.list()).databases;

		for (const database of databases) {
			await tablesDB.delete({ databaseId: database.$id });
			console.log(`Database '${database.$id}' verwijderd`);
		}

		const buckets = (await storage.listBuckets()).buckets;
		for (const bucket of buckets) {
			await storage.deleteBucket({
				bucketId: bucket.$id,
			});
			console.log(`Storage bucket '${bucket.$id}' verwijderd`);
		}
	}
}
