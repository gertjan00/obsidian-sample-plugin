import {
	Client as AppwriteUserClient,
	AppwriteException as AppwriteUserException,
} from "appwrite";
import {
	Client as AppwriteAdminClient,
	AppwriteException as AppwriteAdminException,
} from "node-appwrite";
import { requestUrl, RequestUrlParam } from "obsidian";

async function buildMultipartPayload(
	formData: FormData,
): Promise<{ buffer: ArrayBuffer; boundary: string }> {
	const boundary =
		"----ObsidianAppwriteFormBoundary" +
		Math.random().toString(36).substring(2);

	const encoder = new TextEncoder();
	const parts: Uint8Array[] = [];

	for (const [key, value] of formData.entries()) {
		if (typeof value === "string") {
			parts.push(
				encoder.encode(
					`--${boundary}\r\n` +
						`Content-Disposition: form-data; name="${key}"\r\n\r\n` +
						`${value}\r\n`,
				),
			);
			continue;
		}

		const file = value as File;
		const fileBuffer = new Uint8Array(await file.arrayBuffer());

		parts.push(
			encoder.encode(
				`--${boundary}\r\n` +
					`Content-Disposition: form-data; name="${key}"; filename="${file.name || "blob"}"\r\n` +
					`Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`,
			),
		);
		parts.push(fileBuffer);
		parts.push(encoder.encode("\r\n"));
	}

	parts.push(encoder.encode(`--${boundary}--\r\n`));

	const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
	const result = new Uint8Array(totalLength);

	let offset = 0;
	for (const part of parts) {
		result.set(part, offset);
		offset += part.length;
	}

	return { buffer: result.buffer, boundary };
}

async function appwriteCall(
	client: any,
	ExceptionClass:
		| typeof AppwriteUserException
		| typeof AppwriteAdminException,
	method: string,
	url: URL | string,
	headers: Record<string, string> = {},
	params: any = {},
	responseType = "json",
) {
	const mergedHeaders: Record<string, string> = {
		...(client.headers || {}),
		...headers,
	};

	const upperMethod = method.toUpperCase();
	const options: RequestUrlParam = {
		url: url.toString(),
		method: upperMethod,
		headers: mergedHeaders,
		throw: false,
	};

	if (upperMethod === "GET") {
		const urlObj = new URL(options.url);
		for (const [k, v] of Object.entries(params)) {
			if (Array.isArray(v)) {
				v.forEach((i) =>
					urlObj.searchParams.append(`${k}[]`, String(i)),
				);
			} else {
				urlObj.searchParams.append(k, String(v));
			}
		}
		options.url = urlObj.toString();
	} else if (typeof FormData !== "undefined" && params instanceof FormData) {
		const { buffer, boundary } = await buildMultipartPayload(params);
		options.body = buffer;

		for (const key of Object.keys(mergedHeaders)) {
			if (key.toLowerCase() === "content-type") delete mergedHeaders[key];
		}
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
		client.addHeader("X-Fallback-Cookies", fallbackCookie);
	}

	if (response.status >= 400) {
		let errorData: any;
		try {
			errorData =
				typeof response.json === "object"
					? response.json
					: JSON.parse(response.text);
		} catch {
			errorData = { message: response.text || "Unknown Server Error" };
		}

		throw new ExceptionClass(
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

export class ObsidianUserClient extends AppwriteUserClient {
	override call(
		method: string,
		url: URL | string,
		headers: Record<string, string> = {},
		params: any = {},
		responseType = "json",
	) {
		return appwriteCall(
			this,
			AppwriteUserException,
			method,
			url,
			headers,
			params,
			responseType,
		);
	}
}

export class ObsidianAdminClient extends AppwriteAdminClient {
	override call(
		method: string,
		url: URL | string,
		headers: Record<string, string> = {},
		params: any = {},
		responseType = "json",
	) {
		return appwriteCall(
			this,
			AppwriteAdminException,
			method,
			url,
			headers,
			params,
			responseType,
		);
	}
}
