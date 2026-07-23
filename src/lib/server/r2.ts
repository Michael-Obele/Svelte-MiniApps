/**
 * Cloudflare R2 client (S3-compatible) using the lightweight `aws4fetch` package.
 *
 * Used by the FlashFile feature to upload, download, and delete objects stored
 * in a private R2 bucket. The bucket is not exposed publicly; downloads flow
 * through the SvelteKit server route so we can enforce expiry and record
 * download counts.
 *
 * Environment variables required:
 *   - R2_ACCOUNT_ID
 *   - R2_ACCESS_KEY_ID
 *   - R2_SECRET_ACCESS_KEY
 *   - R2_BUCKET_NAME
 *   - R2_PUBLIC_BASE_URL  (optional — used for presigned read URLs returned to clients)
 */

import { AwsClient } from 'aws4fetch';

export interface R2Config {
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucketName: string;
	publicBaseUrl?: string;
}

export interface R2ObjectInfo {
	key: string;
	size: number;
	contentType: string;
	etag: string;
	uploaded: Date;
}

class R2Client {
	#client: AwsClient | null = null;
	#config: R2Config | null = null;
	#endpoint: string | null = null;

	/**
	 * Lazily initialise the underlying `AwsClient` from environment variables.
	 * Throws a clear error if any of the required env vars are missing so
	 * problems surface immediately during local development.
	 */
	#ensure(): { client: AwsClient; config: R2Config; endpoint: string } {
		if (this.#client && this.#config && this.#endpoint) {
			return { client: this.#client, config: this.#config, endpoint: this.#endpoint };
		}

		const accountId = process.env.R2_ACCOUNT_ID;
		const accessKeyId = process.env.R2_ACCESS_KEY_ID;
		const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
		const bucketName = process.env.R2_BUCKET_NAME;
		const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

		const missing: string[] = [];
		if (!accountId) missing.push('R2_ACCOUNT_ID');
		if (!accessKeyId) missing.push('R2_ACCESS_KEY_ID');
		if (!secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
		if (!bucketName) missing.push('R2_BUCKET_NAME');

		if (missing.length > 0) {
			throw new Error(
				`Cloudflare R2 is not configured. Missing env vars: ${missing.join(', ')}. ` +
					`Add them to .env — see .env.example for instructions.`
			);
		}

		const config: R2Config = {
			accountId: accountId!,
			accessKeyId: accessKeyId!,
			secretAccessKey: secretAccessKey!,
			bucketName: bucketName!,
			publicBaseUrl: publicBaseUrl || undefined
		};

		this.#client = new AwsClient({
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
			service: 's3',
			region: 'auto'
		});
		this.#config = config;
		this.#endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

		return { client: this.#client, config, endpoint: this.#endpoint };
	}

	/** Whether all required env vars are present. Useful for guarding optional flows. */
	isConfigured(): boolean {
		return Boolean(
			process.env.R2_ACCOUNT_ID &&
				process.env.R2_ACCESS_KEY_ID &&
				process.env.R2_SECRET_ACCESS_KEY &&
				process.env.R2_BUCKET_NAME
		);
	}

	/** Returns the public base URL for a custom domain (if configured). */
	getPublicBaseUrl(): string | null {
		const { config } = this.#ensure();
		return config.publicBaseUrl ?? null;
	}

	/** Returns the configured bucket name. */
	getBucketName(): string {
		const { config } = this.#ensure();
		return config.bucketName;
	}

	/** Build the absolute S3 endpoint URL for an object key. */
	#objectUrl(key: string): string {
		const { config, endpoint } = this.#ensure();
		return `${endpoint}/${config.bucketName}/${encodeS3Key(key)}`;
	}

	/**
	 * Upload a `Blob` / `File` / `ArrayBuffer` / `ReadableStream` to R2.
	 * `contentType` is preserved as `Content-Type` so downloads get the right MIME.
	 *
	 * For streaming uploads, pass `contentLength` explicitly. Without it the
	 * R2 S3 endpoint can silently truncate the upload (R2 requires a known
	 * Content-Length on the PUT — it does not support chunked transfer
	 * encoding for object bodies).
	 */
	async putObject(
		key: string,
		body: ReadableStream | ArrayBuffer | Blob,
		contentType: string,
		customMetadata?: Record<string, string>,
		contentLength?: number
	): Promise<R2ObjectInfo> {
		const { client } = this.#ensure();
		const url = this.#objectUrl(key);
		const headers: Record<string, string> = {
			'content-type': contentType || 'application/octet-stream'
		};
		// Pin Content-Length whenever we know it. For Blob/ArrayBuffer we can
		// derive it; for streams we require the caller to pass it.
		if (typeof contentLength === 'number' && contentLength > 0) {
			headers['content-length'] = String(contentLength);
		} else if (body instanceof ArrayBuffer) {
			headers['content-length'] = String(body.byteLength);
		} else if (body instanceof Blob && body.size > 0) {
			headers['content-length'] = String(body.size);
		}
		if (customMetadata) {
			for (const [k, v] of Object.entries(customMetadata)) {
				headers[`x-amz-meta-${k.toLowerCase()}`] = v;
			}
		}

		const request = new Request(url, {
			method: 'PUT',
			body,
			headers
		});
		const signed = await client.sign(request);
		const response = await fetch(signed);

		if (!response.ok) {
			const errText = await response.text().catch(() => response.statusText);
			throw new Error(`R2 upload failed (${response.status}): ${errText}`);
		}

		const etag = response.headers.get('ETag') ?? '';
		return {
			key,
			size: contentLength ?? (body instanceof Blob ? body.size : 0),
			contentType,
			etag,
			uploaded: new Date()
		};
	}

	/**
	 * Download an object as a `ReadableStream` along with its metadata.
	 * Returns `null` if the object doesn't exist.
	 */
	async getObject(
		key: string
	): Promise<{ body: ReadableStream; contentType: string; size: number; etag: string } | null> {
		const { client } = this.#ensure();
		const url = this.#objectUrl(key);
		const request = new Request(url, { method: 'GET' });
		const signed = await client.sign(request);
		const response = await fetch(signed);

		if (response.status === 404) return null;
		if (!response.ok) {
			const errText = await response.text().catch(() => response.statusText);
			throw new Error(`R2 download failed (${response.status}): ${errText}`);
		}

		if (!response.body) return null;

		return {
			body: response.body,
			contentType: response.headers.get('content-type') ?? 'application/octet-stream',
			size: Number(response.headers.get('content-length') ?? 0),
			etag: response.headers.get('etag') ?? ''
		};
	}

	/** Delete one or more object keys. Silently succeeds for missing objects. */
	async deleteObject(key: string): Promise<void> {
		const { client } = this.#ensure();
		const url = this.#objectUrl(key);
		const request = new Request(url, { method: 'DELETE' });
		const signed = await client.sign(request);
		const response = await fetch(signed);
		if (!response.ok && response.status !== 404) {
			const errText = await response.text().catch(() => response.statusText);
			throw new Error(`R2 delete failed (${response.status}): ${errText}`);
		}
	}

	/**
	 * Generate a presigned GET URL that a client can use to download an object
	 * directly from R2 without proxying through our server. Defaults to 1 hour.
	 */
	async getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
		const { client, endpoint, config } = this.#ensure();
		const url = new URL(`${endpoint}/${config.bucketName}/${encodeS3Key(key)}`);
		url.searchParams.set('X-Amz-Expires', String(expiresInSeconds));
		const request = new Request(url, { method: 'GET' });
		const signed = await client.sign(request, { aws: { signQuery: true } });
		return signed.url;
	}
}

/** Encode an S3 object key the way R2 expects (path-style, preserving slashes). */
function encodeS3Key(key: string): string {
	return key
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

/** Singleton — the client is stateless and safe to share. */
export const r2 = new R2Client();
