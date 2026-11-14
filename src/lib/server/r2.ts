/**
 * Cloudflare R2 client (S3-compatible) using the official AWS SDK.
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
 *
 * NOTE: We use @aws-sdk/client-s3 (not s3mini) because the official SDK properly
 * handles S3 custom metadata encoding internally. s3mini passes raw values as
 * HTTP headers, which causes ByteString errors in undici/fetch when metadata
 * contains non-ASCII characters (like em-dashes in filenames). The AWS SDK
 * URL-encodes metadata values before sending and URL-decodes them on retrieval.
 */

import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	DeleteObjectCommand,
	CreateMultipartUploadCommand,
	UploadPartCommand,
	ListPartsCommand,
	CompleteMultipartUploadCommand,
	AbortMultipartUploadCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
	#client: S3Client | null = null;
	#config: R2Config | null = null;

	/**
	 * Lazily initialise the underlying `S3Client` from environment variables.
	 * Throws a clear error if any of the required env vars are missing so
	 * problems surface immediately during local development.
	 */
	#ensure(): { client: S3Client; config: R2Config } {
		if (this.#client && this.#config) {
			return { client: this.#client, config: this.#config };
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

		this.#client = new S3Client({
			region: 'auto',
			endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey
			},
			// Force path-style addressing for R2 compatibility.
			forcePathStyle: true
		});
		this.#config = config;

		return { client: this.#client, config: this.#config };
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

	/**
	 * Upload a `Blob` / `File` / `ArrayBuffer` / `ReadableStream` to R2.
	 *
	 * The AWS SDK handles non-ASCII `customMetadata` values transparently —
	 * it URL-encodes them before sending as `x-amz-meta-*` headers and
	 * URL-decodes them on retrieval. No ByteString issues.
	 *
	 * For streaming uploads, pass `contentLength` explicitly. Without it the
	 * R2 S3 endpoint can silently truncate the upload (R2 requires a known
	 * Content-Length on the PUT — it does not support chunked transfer
	 * encoding for object bodies).
	 */
	async putObject(
		key: string,
		body: ReadableStream | Uint8Array | Blob,
		contentType: string,
		customMetadata?: Record<string, string>,
		contentLength?: number
	): Promise<R2ObjectInfo> {
		const { client, config } = this.#ensure();

		const cmd = new PutObjectCommand({
			Bucket: config.bucketName,
			Key: key,
			Body: body,
			ContentType: contentType || 'application/octet-stream',
			...(customMetadata && Object.keys(customMetadata).length > 0 && { Metadata: customMetadata }),
			...(typeof contentLength === 'number' &&
				contentLength > 0 && { ContentLength: contentLength })
		});

		const response = await client.send(cmd);

		return {
			key,
			size: contentLength ?? 0,
			contentType,
			etag: response.ETag ?? '',
			uploaded: new Date()
		};
	}

	/**
	 * Download an object as a `ReadableStream` along with its metadata.
	 * Returns `null` if the object doesn't exist (NoSuchKey).
	 */
	async getObject(
		key: string
	): Promise<{ body: ReadableStream; contentType: string; size: number; etag: string } | null> {
		const { client, config } = this.#ensure();

		try {
			const response = await client.send(
				new GetObjectCommand({
					Bucket: config.bucketName,
					Key: key
				})
			);

			if (!response.Body) return null;

			return {
				body: response.Body as ReadableStream,
				contentType: response.ContentType ?? 'application/octet-stream',
				size: response.ContentLength ?? 0,
				etag: response.ETag ?? ''
			};
		} catch (e: unknown) {
			if (isNoSuchKey(e)) return null;
			throw e;
		}
	}

	/**
	 * Object size and type without transferring the body, or `null` when the
	 * object does not exist.
	 */
	async headObject(key: string): Promise<{ size: number; contentType: string } | null> {
		const { client, config } = this.#ensure();

		try {
			const response = await client.send(
				new HeadObjectCommand({ Bucket: config.bucketName, Key: key })
			);
			return {
				size: response.ContentLength ?? 0,
				contentType: response.ContentType ?? 'application/octet-stream'
			};
		} catch (e: unknown) {
			if (isNoSuchKey(e)) return null;
			throw e;
		}
	}

	/** Delete an object. Silently succeeds for missing objects. */
	async deleteObject(key: string): Promise<void> {
		const { client, config } = this.#ensure();

		try {
			await client.send(
				new DeleteObjectCommand({
					Bucket: config.bucketName,
					Key: key
				})
			);
		} catch (e: unknown) {
			// 404 is a no-op — object was already gone.
			if (isNoSuchKey(e)) return;
			throw e;
		}
	}

	/**
	 * Generate a presigned GET URL so the browser can download directly from
	 * R2 without proxying through a Netlify function. Defaults to 1 hour.
	 *
	 * When `fileName` is provided, the presigned URL includes
	 * `response-content-disposition=attachment` so the browser forces a
	 * download rather than displaying the file inline.
	 */
	async getPresignedDownloadUrl(
		key: string,
		expiresInSeconds = 3600,
		fileName?: string
	): Promise<string> {
		const { client, config } = this.#ensure();

		const commandInput: { Bucket: string; Key: string; ResponseContentDisposition?: string } = {
			Bucket: config.bucketName,
			Key: key
		};

		if (fileName) {
			// Encode the filename for RFC 5987 compliance so non-ASCII names
			// survive the redirect hop.
			const encoded = encodeURIComponent(fileName);
			commandInput.ResponseContentDisposition = `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`;
		}

		return getSignedUrl(client, new GetObjectCommand(commandInput), {
			expiresIn: expiresInSeconds
		});
	}

	/**
	 * Generate a presigned PUT URL so the browser can upload directly to R2
	 * without proxying the file body through a Netlify function.
	 *
	 * The caller must already have validated ownership, file type, and size.
	 * The URL expires in 30 minutes (plenty for large files, short enough to
	 * limit abuse).
	 *
	 * NOTE: R2 rejects a single PUT larger than 5 GiB — use
	 * `startMultipartUpload` for anything near that ceiling.
	 */
	async getPresignedUploadUrl(
		key: string,
		contentType: string,
		expiresInSeconds = 1800
	): Promise<string> {
		const { client, config } = this.#ensure();
		return getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: config.bucketName,
				Key: key,
				ContentType: contentType
			}),
			{ expiresIn: expiresInSeconds }
		);
	}

	// ---------------------------------------------------------------------
	// Multipart upload — required for objects above R2's 5 GiB PUT ceiling.
	//
	// The flow is: startMultipartUpload() → browser PUTs each part to a
	// presigned URL → completeMultipartUpload() (parts are re-read from R2
	// with listParts, so the browser never has to expose ETags).
	// ---------------------------------------------------------------------

	/** Begin a multipart upload and return its R2 upload id. */
	async startMultipartUpload(key: string, contentType: string): Promise<string> {
		const { client, config } = this.#ensure();

		const response = await client.send(
			new CreateMultipartUploadCommand({
				Bucket: config.bucketName,
				Key: key,
				ContentType: contentType || 'application/octet-stream'
			})
		);

		if (!response.UploadId) {
			throw new Error(`R2 did not return an upload id for ${key}`);
		}
		return response.UploadId;
	}

	/**
	 * Presign one `UploadPart` URL per part number. Signing is a local HMAC
	 * operation, so issuing every part up front costs no R2 round trip.
	 */
	async getPresignedPartUrls(
		key: string,
		uploadId: string,
		partNumbers: number[],
		expiresInSeconds = 21600
	): Promise<{ partNumber: number; url: string }[]> {
		const { client, config } = this.#ensure();

		return Promise.all(
			partNumbers.map(async (partNumber) => ({
				partNumber,
				url: await getSignedUrl(
					client,
					new UploadPartCommand({
						Bucket: config.bucketName,
						Key: key,
						UploadId: uploadId,
						PartNumber: partNumber
					}),
					{ expiresIn: expiresInSeconds }
				)
			}))
		);
	}

	/**
	 * Every part R2 has accepted so far, ordered by part number — or `null` when
	 * the upload id no longer exists (already completed or aborted).
	 */
	async listParts(
		key: string,
		uploadId: string
	): Promise<{ partNumber: number; etag: string; size: number }[] | null> {
		const { client, config } = this.#ensure();

		try {
			const response = await client.send(
				new ListPartsCommand({
					Bucket: config.bucketName,
					Key: key,
					UploadId: uploadId
				})
			);

			return (response.Parts ?? [])
				.map((part) => ({
					partNumber: part.PartNumber ?? 0,
					etag: part.ETag ?? '',
					size: part.Size ?? 0
				}))
				.sort((a, b) => a.partNumber - b.partNumber);
		} catch (e: unknown) {
			if (isNoSuchUpload(e)) return null;
			throw e;
		}
	}

	/** Assemble the uploaded parts into the final object. */
	async completeMultipartUpload(
		key: string,
		uploadId: string,
		parts: { partNumber: number; etag: string }[]
	): Promise<void> {
		const { client, config } = this.#ensure();

		await client.send(
			new CompleteMultipartUploadCommand({
				Bucket: config.bucketName,
				Key: key,
				UploadId: uploadId,
				MultipartUpload: {
					Parts: parts.map((part) => ({ PartNumber: part.partNumber, ETag: part.etag }))
				}
			})
		);
	}

	/** Discard a multipart upload and everything already uploaded for it. */
	async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
		const { client, config } = this.#ensure();

		try {
			await client.send(
				new AbortMultipartUploadCommand({
					Bucket: config.bucketName,
					Key: key,
					UploadId: uploadId
				})
			);
		} catch (e: unknown) {
			// Already completed or aborted — nothing left to clean up.
			if (isNoSuchUpload(e)) return;
			throw e;
		}
	}
}

/**
 * Check if an error is an S3 NoSuchKey / 404.
 * The AWS SDK throws `NoSuchKey` for missing objects (and NotFound for buckets).
 */
function isNoSuchKey(e: unknown): boolean {
	if (e && typeof e === 'object' && 'name' in e) {
		const name = (e as { name: string }).name;
		return name === 'NoSuchKey' || name === 'NotFound';
	}
	return false;
}

/** Check if an error means the multipart upload no longer exists. */
function isNoSuchUpload(e: unknown): boolean {
	if (e && typeof e === 'object' && 'name' in e) {
		const name = (e as { name: string }).name;
		return name === 'NoSuchUpload' || name === 'NotFound';
	}
	return false;
}

/** Singleton — the client is stateless and safe to share. */
export const r2 = new R2Client();
