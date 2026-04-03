// @ts-nocheck
import { type Models } from 'appwrite';

export type Table1Create = {
    "email"?: string | null;
    "description"?: string | null;
    "city"?: string | null;
    "name"?: string | null;
    "route"?: Array<Array<number>> | null;
    "active"?: boolean | null;
    "age"?: number | null;
    "location"?: Array<number> | null;
}

export type Table1 = Models.Row & {
    "email"?: string | null;
    "description"?: string | null;
    "city"?: string | null;
    "name"?: string | null;
    "route"?: Array<Array<number>> | null;
    "active"?: boolean | null;
    "age"?: number | null;
    "location"?: Array<number> | null;
}

export type Table2Create = {
    "name"?: string | null;
    "description"?: string | null;
    "email"?: string | null;
    "active"?: boolean | null;
    "location"?: Array<number> | null;
    "city"?: string | null;
    "route"?: Array<Array<number>> | null;
    "age"?: number | null;
}

export type Table2 = Models.Row & {
    "name"?: string | null;
    "description"?: string | null;
    "email"?: string | null;
    "active"?: boolean | null;
    "location"?: Array<number> | null;
    "city"?: string | null;
    "route"?: Array<Array<number>> | null;
    "age"?: number | null;
}

declare const __roleStringBrand: unique symbol;
export type RoleString = string & { readonly [__roleStringBrand]: never };

export type RoleBuilder = {
  any: () => RoleString;
  user: (userId: string, status?: string) => RoleString;
  users: (status?: string) => RoleString;
  guests: () => RoleString;
  team: (teamId: string, role?: string) => RoleString;
  member: (memberId: string) => RoleString;
  label: (label: string) => RoleString;
}

export type PermissionBuilder = {
  read: (role: RoleString) => string;
  write: (role: RoleString) => string;
  create: (role: RoleString) => string;
  update: (role: RoleString) => string;
  delete: (role: RoleString) => string;
}

export type PermissionCallback = (permission: PermissionBuilder, role: RoleBuilder) => string[];

export type QueryValue = string | number | boolean;

export type ExtractQueryValue<T> = T extends (infer U)[]
  ? U extends QueryValue ? U : never
  : T extends QueryValue | null ? NonNullable<T> : never;

export type QueryableKeys<T> = {
  [K in keyof T]: ExtractQueryValue<T[K]> extends never ? never : K;
}[keyof T];

export type QueryBuilder<T> = {
  equal: <K extends QueryableKeys<T>>(field: K, value: ExtractQueryValue<T[K]>) => string;
  notEqual: <K extends QueryableKeys<T>>(field: K, value: ExtractQueryValue<T[K]>) => string;
  lessThan: <K extends QueryableKeys<T>>(field: K, value: ExtractQueryValue<T[K]>) => string;
  lessThanEqual: <K extends QueryableKeys<T>>(field: K, value: ExtractQueryValue<T[K]>) => string;
  greaterThan: <K extends QueryableKeys<T>>(field: K, value: ExtractQueryValue<T[K]>) => string;
  greaterThanEqual: <K extends QueryableKeys<T>>(field: K, value: ExtractQueryValue<T[K]>) => string;
  contains: <K extends QueryableKeys<T>>(field: K, value: ExtractQueryValue<T[K]>) => string;
  search: <K extends QueryableKeys<T>>(field: K, value: string) => string;
  isNull: <K extends QueryableKeys<T>>(field: K) => string;
  isNotNull: <K extends QueryableKeys<T>>(field: K) => string;
  startsWith: <K extends QueryableKeys<T>>(field: K, value: string) => string;
  endsWith: <K extends QueryableKeys<T>>(field: K, value: string) => string;
  between: <K extends QueryableKeys<T>>(field: K, start: ExtractQueryValue<T[K]>, end: ExtractQueryValue<T[K]>) => string;
  select: <K extends keyof T>(fields: K[]) => string;
  orderAsc: <K extends keyof T>(field: K) => string;
  orderDesc: <K extends keyof T>(field: K) => string;
  limit: (value: number) => string;
  offset: (value: number) => string;
  cursorAfter: (documentId: string) => string;
  cursorBefore: (documentId: string) => string;
  or: (...queries: string[]) => string;
  and: (...queries: string[]) => string;
}

export type DatabaseId = "69cf93310034c03294d7";

export type DatabaseTableMap = {
  "69cf93310034c03294d7": {
    "table 1": {
      create: (data: {
        "email"?: string | null;
        "description"?: string | null;
        "city"?: string | null;
        "name"?: string | null;
        "route"?: Array<Array<number>> | null;
        "active"?: boolean | null;
        "age"?: number | null;
        "location"?: Array<number> | null;
      }, options?: { rowId?: string; permissions?: (permission: { read: (role: RoleString) => string; write: (role: RoleString) => string; create: (role: RoleString) => string; update: (role: RoleString) => string; delete: (role: RoleString) => string }, role: { any: () => RoleString; user: (userId: string, status?: string) => RoleString; users: (status?: string) => RoleString; guests: () => RoleString; team: (teamId: string, role?: string) => RoleString; member: (memberId: string) => RoleString; label: (label: string) => RoleString }) => string[]; transactionId?: string }) => Promise<Table1>;
      get: (id: string) => Promise<Table1>;
      update: (id: string, data: Partial<{
        "email"?: string | null;
        "description"?: string | null;
        "city"?: string | null;
        "name"?: string | null;
        "route"?: Array<Array<number>> | null;
        "active"?: boolean | null;
        "age"?: number | null;
        "location"?: Array<number> | null;
      }>, options?: { permissions?: (permission: { read: (role: RoleString) => string; write: (role: RoleString) => string; create: (role: RoleString) => string; update: (role: RoleString) => string; delete: (role: RoleString) => string }, role: { any: () => RoleString; user: (userId: string, status?: string) => RoleString; users: (status?: string) => RoleString; guests: () => RoleString; team: (teamId: string, role?: string) => RoleString; member: (memberId: string) => RoleString; label: (label: string) => RoleString }) => string[]; transactionId?: string }) => Promise<Table1>;
      delete: (id: string, options?: { transactionId?: string }) => Promise<void>;
      list: (options?: { queries?: (q: { equal: <K extends QueryableKeys<Table1>>(field: K, value: ExtractQueryValue<Table1[K]>) => string; notEqual: <K extends QueryableKeys<Table1>>(field: K, value: ExtractQueryValue<Table1[K]>) => string; lessThan: <K extends QueryableKeys<Table1>>(field: K, value: ExtractQueryValue<Table1[K]>) => string; lessThanEqual: <K extends QueryableKeys<Table1>>(field: K, value: ExtractQueryValue<Table1[K]>) => string; greaterThan: <K extends QueryableKeys<Table1>>(field: K, value: ExtractQueryValue<Table1[K]>) => string; greaterThanEqual: <K extends QueryableKeys<Table1>>(field: K, value: ExtractQueryValue<Table1[K]>) => string; contains: <K extends QueryableKeys<Table1>>(field: K, value: ExtractQueryValue<Table1[K]>) => string; search: <K extends QueryableKeys<Table1>>(field: K, value: string) => string; isNull: <K extends QueryableKeys<Table1>>(field: K) => string; isNotNull: <K extends QueryableKeys<Table1>>(field: K) => string; startsWith: <K extends QueryableKeys<Table1>>(field: K, value: string) => string; endsWith: <K extends QueryableKeys<Table1>>(field: K, value: string) => string; between: <K extends QueryableKeys<Table1>>(field: K, start: ExtractQueryValue<Table1[K]>, end: ExtractQueryValue<Table1[K]>) => string; select: <K extends keyof Table1>(fields: K[]) => string; orderAsc: <K extends keyof Table1>(field: K) => string; orderDesc: <K extends keyof Table1>(field: K) => string; limit: (value: number) => string; offset: (value: number) => string; cursorAfter: (documentId: string) => string; cursorBefore: (documentId: string) => string; or: (...queries: string[]) => string; and: (...queries: string[]) => string }) => string[] }) => Promise<{ total: number; rows: Table1[] }>;
    };
    "table 2": {
      create: (data: {
        "name"?: string | null;
        "description"?: string | null;
        "email"?: string | null;
        "active"?: boolean | null;
        "location"?: Array<number> | null;
        "city"?: string | null;
        "route"?: Array<Array<number>> | null;
        "age"?: number | null;
      }, options?: { rowId?: string; permissions?: (permission: { read: (role: RoleString) => string; write: (role: RoleString) => string; create: (role: RoleString) => string; update: (role: RoleString) => string; delete: (role: RoleString) => string }, role: { any: () => RoleString; user: (userId: string, status?: string) => RoleString; users: (status?: string) => RoleString; guests: () => RoleString; team: (teamId: string, role?: string) => RoleString; member: (memberId: string) => RoleString; label: (label: string) => RoleString }) => string[]; transactionId?: string }) => Promise<Table2>;
      get: (id: string) => Promise<Table2>;
      update: (id: string, data: Partial<{
        "name"?: string | null;
        "description"?: string | null;
        "email"?: string | null;
        "active"?: boolean | null;
        "location"?: Array<number> | null;
        "city"?: string | null;
        "route"?: Array<Array<number>> | null;
        "age"?: number | null;
      }>, options?: { permissions?: (permission: { read: (role: RoleString) => string; write: (role: RoleString) => string; create: (role: RoleString) => string; update: (role: RoleString) => string; delete: (role: RoleString) => string }, role: { any: () => RoleString; user: (userId: string, status?: string) => RoleString; users: (status?: string) => RoleString; guests: () => RoleString; team: (teamId: string, role?: string) => RoleString; member: (memberId: string) => RoleString; label: (label: string) => RoleString }) => string[]; transactionId?: string }) => Promise<Table2>;
      delete: (id: string, options?: { transactionId?: string }) => Promise<void>;
      list: (options?: { queries?: (q: { equal: <K extends QueryableKeys<Table2>>(field: K, value: ExtractQueryValue<Table2[K]>) => string; notEqual: <K extends QueryableKeys<Table2>>(field: K, value: ExtractQueryValue<Table2[K]>) => string; lessThan: <K extends QueryableKeys<Table2>>(field: K, value: ExtractQueryValue<Table2[K]>) => string; lessThanEqual: <K extends QueryableKeys<Table2>>(field: K, value: ExtractQueryValue<Table2[K]>) => string; greaterThan: <K extends QueryableKeys<Table2>>(field: K, value: ExtractQueryValue<Table2[K]>) => string; greaterThanEqual: <K extends QueryableKeys<Table2>>(field: K, value: ExtractQueryValue<Table2[K]>) => string; contains: <K extends QueryableKeys<Table2>>(field: K, value: ExtractQueryValue<Table2[K]>) => string; search: <K extends QueryableKeys<Table2>>(field: K, value: string) => string; isNull: <K extends QueryableKeys<Table2>>(field: K) => string; isNotNull: <K extends QueryableKeys<Table2>>(field: K) => string; startsWith: <K extends QueryableKeys<Table2>>(field: K, value: string) => string; endsWith: <K extends QueryableKeys<Table2>>(field: K, value: string) => string; between: <K extends QueryableKeys<Table2>>(field: K, start: ExtractQueryValue<Table2[K]>, end: ExtractQueryValue<Table2[K]>) => string; select: <K extends keyof Table2>(fields: K[]) => string; orderAsc: <K extends keyof Table2>(field: K) => string; orderDesc: <K extends keyof Table2>(field: K) => string; limit: (value: number) => string; offset: (value: number) => string; cursorAfter: (documentId: string) => string; cursorBefore: (documentId: string) => string; or: (...queries: string[]) => string; and: (...queries: string[]) => string }) => string[] }) => Promise<{ total: number; rows: Table2[] }>;
    }
  }
};

export type DatabaseHandle<D extends DatabaseId> = {
  use: <T extends keyof DatabaseTableMap[D] & string>(tableId: T) => DatabaseTableMap[D][T];

};

export type DatabaseTables = {
  use: <D extends DatabaseId>(databaseId: D) => DatabaseHandle<D>;

};
