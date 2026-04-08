export const template = {
	buckets: [
		{
			bucketId: "binary_files",
			name: "Binary Files",
		},
	],
	databases: [
		{
			id: "obsidian",
			name: "Obsidian",
			tables: [
				{
					id: "files",
					name: "Files",
					permission: ["team:members"],
					rowSecurity: false,
					columns: [
						{
							key: "path",
							size: 1024,
							required: true,
							type: "string",
						},
						{
							key: "content",
							size: 1000000,
							required: false,
							type: "string",
						},
						{
							key: "last_modified_by",
							size: 255,
							required: true,
							type: "string",
						},
						{
							key: "last_modified_at",
							required: true,
							type: "datetime",
						},
						{
							key: "checksum",
							size: 255,
							required: true,
							type: "string",
						},
					],
					indexes: [
						{
							key: "idx_path",
							type: "unique",
							attributes: ["path"],
						},
					],
				},
				{
					id: "presence",
					name: "Presence",
					permission: ["team:members"],
					rowSecurity: false,
					columns: [
						{
							key: "user_id",
							size: 255,
							required: true,
							type: "string",
						},
						{
							key: "user_name",
							size: 255,
							required: true,
							type: "string",
						},
						{
							key: "color",
							size: 10,
							required: true,
							type: "string",
						},
						{
							key: "file_path",
							size: 1024,
							required: true,
							type: "string",
						},
						{
							key: "cursor_line",
							required: true,
							type: "integer",
						},
						{
							key: "cursor_char",
							required: true,
							type: "integer",
						},
						{
							key: "last_seen_at",
							required: true,
							type: "datetime",
						},
					],
					indexes: [
						{
							key: "idx_user",
							type: "unique",
							attributes: ["user_id"],
						},
						{
							key: "idx_file",
							type: "key",
							attributes: ["file_path"],
						},
					],
				},
			],
		},
	],
};
