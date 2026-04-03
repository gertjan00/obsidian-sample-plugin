import fs from "fs";

const dir = "./generated/appwrite";

(() => {
	const files = fs.readdirSync(dir, { withFileTypes: true });

	files.forEach((file) => {
		if (!file.isFile() || !file.name.endsWith(".ts")) return;

		const path = `${dir}/${file.name}`;
		const content = fs.readFileSync(path, "utf-8");

		if (content.startsWith("// @ts-nocheck")) return;
		fs.writeFileSync(path, `// @ts-nocheck\n${content}`);
	});
})();
