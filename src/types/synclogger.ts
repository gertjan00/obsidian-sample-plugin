export interface SyncLogger {
	log: (msg: string, indentation: number, color?: string) => void;
}
