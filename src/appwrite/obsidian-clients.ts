import {
	Client as AppwriteUserClient,
	AppwriteException as AppwriteUserException,
} from "appwrite";
import {
	Client as AppwriteAdminClient,
	AppwriteException as AppwriteAdminException,
} from "node-appwrite";
import { requestUrl, RequestUrlParam } from "obsidian";

// Helper: Zet FormData handmatig om naar een binaire ArrayBuffer voor Obsidian
async function buildMultipartPayload(
	formData: FormData,
): Promise<{ buffer: ArrayBuffer; boundary: string }> {
	const boundary =
		"----ObsidianAppwriteFormBoundary" +
		Math.random().toString(36).substring(2);
	const parts: Uint8Array[] = [];
	const encoder = new TextEncoder();

	for (const [key, value] of Array.from(formData.entries())) {
		let header = `--${boundary}\r\n`;

		if (typeof value !== "string") {
			const file = value as any;
			const filename = file.name || "blob";
			const contentType = file.type || "application/octet-stream";

			header += `Content-Disposition: form-data; name="${key}"; filename="${filename}"\r\n`;
			header += `Content-Type: ${contentType}\r\n\r\n`;
			parts.push(encoder.encode(header));

			const fileBuffer = await file.arrayBuffer();
			parts.push(new Uint8Array(fileBuffer));
			parts.push(encoder.encode("\r\n"));
		} else {
			header += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
			header += `${value}\r\n`;
			parts.push(encoder.encode(header));
		}
	}
	parts.push(encoder.encode(`--${boundary}--\r\n`));

	const totalLength = parts.reduce((acc, curr) => acc + curr.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const part of parts) {
		result.set(part, offset);
		offset += part.length;
	}

	return { buffer: result.buffer, boundary };
}

export class ObsidianUserClient extends AppwriteUserClient {
	override async call(
		method: string,
		url: URL | string,
		headers: { [key: string]: string } = {},
		params: any = {},
		responseType: string = "json",
	): Promise<any> {
		const internalHeaders = (this as any).headers || {};
		const mergedHeaders: Record<string, string> = {
			...internalHeaders,
			...headers,
		};
		let requestUrlStr = url.toString();
		const options: RequestUrlParam = {
			url: requestUrlStr,
			method: method.toUpperCase(),
			headers: mergedHeaders,
			throw: false,
		};

		if (method.toUpperCase() === "GET") {
			const urlObj = new URL(requestUrlStr);
			Object.entries(params).forEach(([k, v]) => {
				if (Array.isArray(v)) {
					v.forEach((i) =>
						urlObj.searchParams.append(`${k}[]`, String(i)),
					);
				} else {
					urlObj.searchParams.append(k, String(v));
				}
			});
			options.url = urlObj.toString();
		} else {
			if (typeof FormData !== "undefined" && params instanceof FormData) {
				const { buffer, boundary } =
					await buildMultipartPayload(params);
				options.body = buffer;

				const ctKey = Object.keys(mergedHeaders).find(
					(k) => k.toLowerCase() === "content-type",
				);
				if (ctKey) delete mergedHeaders[ctKey];

				mergedHeaders["Content-Type"] =
					`multipart/form-data; boundary=${boundary}`;
			} else {
				options.body = JSON.stringify(params);
				if (
					!Object.keys(mergedHeaders).some(
						(k) => k.toLowerCase() === "content-type",
					)
				) {
					mergedHeaders["Content-Type"] = "application/json";
				}
			}
		}

		const response = await requestUrl(options);
		const responseHeaders = response.headers || {};

		const fallbackCookie =
			responseHeaders["x-fallback-cookies"] ||
			responseHeaders["X-Fallback-Cookies"];
		if (
			fallbackCookie &&
			typeof window !== "undefined" &&
			window.localStorage
		) {
			window.localStorage.setItem("cookieFallback", fallbackCookie);
			(this as any).addHeader("X-Fallback-Cookies", fallbackCookie);
		}

		if (response.status >= 400) {
			let errorData: any = {};
			try {
				errorData =
					typeof response.json === "object"
						? response.json
						: JSON.parse(response.text);
			} catch {
				errorData = {
					message: response.text || "Unknown Server Error",
				};
			}
			throw new AppwriteUserException(
				errorData.message || "Unknown Error",
				response.status,
				errorData.type || "unknown",
				errorData,
			);
		}

		if (responseType === "arraybuffer") return response.arrayBuffer;
		if (responseType === "text") return response.text;

		try {
			return typeof response.json === "object"
				? response.json
				: JSON.parse(response.text);
		} catch {
			return response.text;
		}
	}
}

export class ObsidianAdminClient extends AppwriteAdminClient {
	override async call(
		method: string,
		url: URL | string,
		headers: { [key: string]: string } = {},
		params: any = {},
		responseType: string = "json",
	): Promise<any> {
		const internalHeaders = (this as any).headers || {};
		const mergedHeaders: Record<string, string> = {
			...internalHeaders,
			...headers,
		};
		let requestUrlStr = url.toString();
		const options: RequestUrlParam = {
			url: requestUrlStr,
			method: method.toUpperCase(),
			headers: mergedHeaders,
			throw: false,
		};

		if (method.toUpperCase() === "GET") {
			const urlObj = new URL(requestUrlStr);
			Object.entries(params).forEach(([k, v]) => {
				if (Array.isArray(v)) {
					v.forEach((i) =>
						urlObj.searchParams.append(`${k}[]`, String(i)),
					);
				} else {
					urlObj.searchParams.append(k, String(v));
				}
			});
			options.url = urlObj.toString();
		} else {
			if (typeof FormData !== "undefined" && params instanceof FormData) {
				const { buffer, boundary } =
					await buildMultipartPayload(params);
				options.body = buffer;

				const ctKey = Object.keys(mergedHeaders).find(
					(k) => k.toLowerCase() === "content-type",
				);
				if (ctKey) delete mergedHeaders[ctKey];

				mergedHeaders["Content-Type"] =
					`multipart/form-data; boundary=${boundary}`;
			} else {
				options.body = JSON.stringify(params);
				if (
					!Object.keys(mergedHeaders).some(
						(k) => k.toLowerCase() === "content-type",
					)
				) {
					mergedHeaders["Content-Type"] = "application/json";
				}
			}
		}

		const response = await requestUrl(options);
		const responseHeaders = response.headers || {};

		const fallbackCookie =
			responseHeaders["x-fallback-cookies"] ||
			responseHeaders["X-Fallback-Cookies"];
		if (
			fallbackCookie &&
			typeof window !== "undefined" &&
			window.localStorage
		) {
			window.localStorage.setItem("cookieFallback", fallbackCookie);
			(this as any).addHeader("X-Fallback-Cookies", fallbackCookie);
		}

		if (response.status >= 400) {
			let errorData: any = {};
			try {
				errorData =
					typeof response.json === "object"
						? response.json
						: JSON.parse(response.text);
			} catch {
				errorData = {
					message: response.text || "Unknown Server Error",
				};
			}
			throw new AppwriteUserException(
				errorData.message || "Unknown Error",
				response.status,
				errorData.type || "unknown",
				errorData,
			);
		}

		if (responseType === "arraybuffer") return response.arrayBuffer;
		if (responseType === "text") return response.text;

		try {
			return typeof response.json === "object"
				? response.json
				: JSON.parse(response.text);
		} catch {
			return response.text;
		}
	}
}
