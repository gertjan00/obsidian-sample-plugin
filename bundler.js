import fs from "fs";
import path from "path";

const SRC_DIR = path.join(process.cwd(), "src");

// Bestanden/folders die je meestal niet wilt meenemen
const IGNORE_DIRS = new Set([
	"node_modules",
	".git",
	"dist",
	"build",
	".next",
	"coverage",
]);

const IGNORE_EXTENSIONS = new Set([
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".ico",
	".pdf",
	".zip",
	".mp4",
	".mp3",
	".woff",
	".woff2",
	".ttf",
	".eot",
]);

function getAllFiles(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	let files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (IGNORE_DIRS.has(entry.name)) continue;
			files = files.concat(getAllFiles(fullPath));
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name).toLowerCase();
			if (IGNORE_EXTENSIONS.has(ext)) continue;
			files.push(fullPath);
		}
	}

	return files;
}

function isProbablyTextFile(filePath) {
	try {
		const buffer = fs.readFileSync(filePath);
		for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
			if (buffer[i] === 0) return false;
		}
		return true;
	} catch {
		return false;
	}
}

(async () => {
	try {
		if (!fs.existsSync(SRC_DIR)) {
			console.error("Map /src bestaat niet.");
			process.exit(1);
		}

		const allFiles = getAllFiles(SRC_DIR).filter(isProbablyTextFile);

		if (allFiles.length === 0) {
			console.log("Geen tekstbestanden gevonden in /src.");
			process.exit(0);
		}

		let output = "";

		for (const file of allFiles) {
			const relativePath = path.relative(process.cwd(), file);
			const content = fs.readFileSync(file, "utf8");

			output += `\n===== FILE: ${relativePath} =====\n`;
			output += content;
			output += `\n`;
		}

		const clipboardyModule = await import("clipboardy");
		await clipboardyModule.default.write(output);

		console.log(
			`Klaar. ${allFiles.length} bestanden uit /src staan nu op je clipboard.`,
		);
	} catch (error) {
		console.error("Fout bij bundelen:", error);
		process.exit(1);
	}
})();
