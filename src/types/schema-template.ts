type BaseColumn<TDefault> = {
	key: string;
	required: boolean;
	default?: TDefault;
	array?: boolean;
};

type BooleanColumn = BaseColumn<boolean> & { type: "boolean" };
type DateTimeColumn = BaseColumn<string> & { type: "datetime" };
type EmailColumn = BaseColumn<string> & { type: "email" };
type UrlColumn = BaseColumn<string> & { type: "url" };

type EnumColumn = BaseColumn<string> & {
	type: "enum";
	elements: string[];
};

type IntegerColumn = BaseColumn<number> & {
	type: "integer";
	min?: number;
	max?: number;
};

type StringColumn = BaseColumn<string> & {
	type: "string";
	size: number;
	encrypt?: boolean;
};

export type Column =
	| BooleanColumn
	| DateTimeColumn
	| EmailColumn
	| EnumColumn
	| IntegerColumn
	| StringColumn
	| UrlColumn;

export type Index = {
	key: string;
	type: "unique" | "fulltext" | "key";
	attributes: string[];
};

export type Table = {
	id: string;
	name: string;
	permission?: string[];
	rowSecurity?: boolean;
	enabled?: boolean;
	columns: Column[];
	indexes?: Index[];
};

export type Database = {
	id: string;
	name: string;
	tables: Table[];
};

export interface TSchema {
	databases: Database[];
}

// Helper functies
export const booleanColumn = (
	params: Omit<BooleanColumn, "type">,
): BooleanColumn => ({
	...params,
	type: "boolean",
});

export const dateTimeColumn = (
	params: Omit<DateTimeColumn, "type">,
): DateTimeColumn => ({
	...params,
	type: "datetime",
});

export const emailColumn = (
	params: Omit<EmailColumn, "type">,
): EmailColumn => ({
	...params,
	type: "email",
});

export const enumColumn = (params: Omit<EnumColumn, "type">): EnumColumn => ({
	...params,
	type: "enum",
});

export const integerColumn = (
	params: Omit<IntegerColumn, "type">,
): IntegerColumn => ({
	...params,
	type: "integer",
});

export const stringColumn = (
	params: Omit<StringColumn, "type">,
): StringColumn => ({
	...params,
	type: "string",
});

export const urlColumn = (params: Omit<UrlColumn, "type">): UrlColumn => ({
	...params,
	type: "url",
});

export const template: TSchema = {
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
						stringColumn({
							key: "path",
							size: 1024,
							required: true,
						}),
						stringColumn({
							key: "content",
							size: 1000000,
							required: false,
						}),
						stringColumn({
							key: "last_modified_by",
							size: 255,
							required: true,
						}),
						dateTimeColumn({
							key: "last_modified_at",
							required: true,
						}),
						stringColumn({
							key: "checksum",
							size: 255,
							required: true,
						}),
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
						stringColumn({
							key: "user_id",
							size: 255,
							required: true,
						}),
						stringColumn({
							key: "user_name",
							size: 255,
							required: true,
						}),
						stringColumn({
							key: "color",
							size: 10,
							required: true,
						}),
						stringColumn({
							key: "file_path",
							size: 1024,
							required: true,
						}),
						integerColumn({
							key: "cursor_line",
							required: true,
						}),
						integerColumn({
							key: "cursor_char",
							required: true,
						}),
						dateTimeColumn({
							key: "last_seen_at",
							required: true,
						}),
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
