/**
 * Type definitions for the FlashFile feature (R2-backed temporary file sharing).
 *
 * These mirror the Prisma `FlashFile` model so it can be safely returned
 * across the server/client boundary by remote functions and SvelteKit loaders.
 */

export interface FlashFileItem {
	id: string;
	slug: string;
	flashTextId: string;
	fileName: string;
	fileSize: number;
	contentType: string;
	downloadCount: number;
	expiresAt: string;
	createdAt: string;
	userId: string | null;
	/** R2 object key (server-only — never serialised to clients). */
	storageKey?: string;
}

/**
 * Normal per-file ceiling in bytes (600 MB).
 *
 * R2 supports up to 5 TB per object, so 600 MB is well within the hard
 * limit. We pick 600 MB because (a) it's enough for almost any file
 * users would want to share temporarily, and (b) the SvelteKit server
 * route streams the body straight to R2 so memory usage stays flat
 * regardless of file size.
 *
 * This also doubles as the "large file" threshold: anything bigger is a
 * one-off large upload, and only one of those may exist at a time.
 *
 * NOTE: This constant is shared with the client for UI validation. The
 * effective limit can be temporarily raised via `RESOLVED_MAX_FILE_SIZE_MB`.
 */
export const MAX_FILE_SIZE = 600 * 1024 * 1024;

/**
 * Files larger than this are treated as "large". Only ONE non-expired large
 * file may be stored at a time. Enforced in /api/flash-files/start-upload.
 */
export const LARGE_FILE_THRESHOLD = MAX_FILE_SIZE;

/**
 * Total R2 storage budget before new uploads are refused.
 *
 * Cloudflare R2's free tier is 10 GB. Kept in GB (decimal, 10^9 bytes) so the
 * budget can never exceed the plan regardless of how Cloudflare meters it.
 * When the summed size of all non-expired files reaches this, uploads are
 * frozen until files expire (each file lives at most 24 h).
 */
export const STORAGE_BUDGET_GB = 10;
export const STORAGE_BUDGET_BYTES = STORAGE_BUDGET_GB * 1000 ** 3;

/**
 * TEMPORARY: overridable max file size in megabytes.
 *
 * Currently raised to 6144 (6 GB) so a single large file can be shared. To
 * restore the normal limit, set this back to 600; set to 0 to fall back to
 * `MAX_FILE_SIZE`.
 *
 * Files above `LARGE_FILE_THRESHOLD` (600 MB) are restricted to signed-in
 * users — they are the only uploads that can consume the whole free R2
 * budget, and they are the only ones using multipart upload.
 */
export const RESOLVED_MAX_FILE_SIZE_MB = 6 * 1024;

/** Resolve the effective max file size using the code-level override. */
export function resolveEffectiveMaxFileSize(): number {
	if (!RESOLVED_MAX_FILE_SIZE_MB || RESOLVED_MAX_FILE_SIZE_MB <= 0) return MAX_FILE_SIZE;
	return RESOLVED_MAX_FILE_SIZE_MB * 1024 * 1024;
}

/**
 * Files at or above this size are uploaded with R2 multipart upload.
 *
 * Cloudflare R2 rejects a single `PutObject` larger than 5 GiB
 * (see https://developers.cloudflare.com/r2/platform/limits/ — "Maximum
 * upload size: 5 GiB (single-part) / 4.995 TiB (multi-part)"). The browser
 * PUT to a presigned single-part URL therefore fails with HTTP 400 for
 * anything bigger, which is why a 5.57 GB file never uploaded.
 *
 * 4 GiB keeps a full GiB of headroom below that ceiling so a slightly
 * under-5 GiB file can't straddle the limit.
 */
export const MULTIPART_THRESHOLD = 4 * 1024 * 1024 * 1024;

/** Preferred multipart part size (32 MiB — cheap to re-send one part). */
export const MULTIPART_PART_SIZE = 32 * 1024 * 1024;

/** Part count we plan for. R2's hard limit is 10,000 parts per upload. */
export const MAX_MULTIPART_PARTS = 900;

/**
 * Split a file into multipart parts. Parts must be at least 5 MiB (R2/S3
 * rule) and there may be at most 10,000 of them, so the part size grows with
 * the file instead of the part count.
 */
export function planMultipartUpload(totalBytes: number): { partSize: number; partCount: number } {
	const mib = 1024 * 1024;
	const minForCountLimit = Math.ceil(totalBytes / MAX_MULTIPART_PARTS / mib) * mib;
	const partSize = Math.max(MULTIPART_PART_SIZE, minForCountLimit);
	return { partSize, partCount: Math.ceil(totalBytes / partSize) };
}

/**
 * Allowed MIME type prefixes. Empty array = allow all.
 *
 * Flash Text is a temporary file-sharing tool, so any file type is accepted.
 * A whitelist would silently reject valid uploads because browsers disagree
 * on the MIME type they report for the same extension — e.g. `.zip` is
 * `application/zip` in Chrome but `application/x-zip-compressed` in Firefox
 * and some Windows browsers, and other archives (`7z`, `rar`, …) aren't
 * standardized at all. Size enforcement still applies via `MAX_FILE_SIZE` /
 * `resolveEffectiveMaxFileSize()`.
 */
export const ALLOWED_FILE_PREFIXES: string[] = [];

/**
 * Fallback content types for extensions where browsers commonly report an
 * empty MIME type (notably `.zip` on some platforms and older Safari).
 */
const EXTENSION_CONTENT_TYPES: Record<string, string> = {
	zip: 'application/zip',
	'7z': 'application/x-7z-compressed',
	rar: 'application/vnd.rar',
	tar: 'application/x-tar',
	gz: 'application/gzip',
	tgz: 'application/gzip',
	bz2: 'application/x-bzip2',
	pdf: 'application/pdf',
	json: 'application/json',
	xml: 'application/xml',
	csv: 'text/csv',
	txt: 'text/plain',
	md: 'text/markdown',
	html: 'text/html',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

/**
 * Resolve the content type to send for a file. Prefers the browser-reported
 * MIME type; falls back to a known type derived from the file extension when
 * the browser reports none (common for `.zip` and other archives), and finally
 * to `application/octet-stream`.
 */
export function resolveContentType(file: { name: string; type: string }): string {
	if (file.type) return file.type;
	return EXTENSION_CONTENT_TYPES[getFileExtension(file.name)] ?? 'application/octet-stream';
}

/** Human-friendly size label, e.g. "12.4 MB". */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Best-effort extension extraction, lowercased, no dot. */
export function getFileExtension(name: string): string {
	const idx = name.lastIndexOf('.');
	if (idx === -1 || idx === name.length - 1) return '';
	return name.slice(idx + 1).toLowerCase();
}

/** Returns a Lucide-style icon hint for the given content type. */
export function getFileIconHint(
	contentType: string
): 'image' | 'video' | 'audio' | 'archive' | 'doc' | 'file' {
	if (contentType.startsWith('image/')) return 'image';
	if (contentType.startsWith('video/')) return 'video';
	if (contentType.startsWith('audio/')) return 'audio';
	if (
		contentType === 'application/zip' ||
		contentType === 'application/x-tar' ||
		contentType === 'application/gzip'
	)
		return 'archive';
	if (
		contentType.startsWith('text/') ||
		contentType === 'application/pdf' ||
		contentType.includes('officedocument') ||
		contentType.includes('msword') ||
		contentType.includes('ms-excel') ||
		contentType.includes('ms-powerpoint')
	)
		return 'doc';
	return 'file';
}
