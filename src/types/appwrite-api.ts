import { Models } from "node-appwrite";

export interface AppwriteAPI {
	"/databases": {
		GET: { reponse: Models.DatabaseList; body: undefined };
		POST: {
			response: Models.Database;
			body: { databaseId: string; name: string };
		};
	};
}
