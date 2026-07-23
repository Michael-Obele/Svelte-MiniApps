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
 * Maximum upload size in bytes.
 *
 * R2 supports up to 5 TB per object, so 600 MB is well within the hard
 * limit. We pick 600 MB because (a) it's enough for almost any file
 * users would want to share temporarily, and (b) the SvelteKit server
 * route streams the body straight to R2 so memory usage stays flat
 * regardless of file size.
 *
 * Override at deploy time by setting `MAX_FILE_SIZE_MB` in the
 * environment. The constant is computed at module-load so it can be
 * tweaked per environment without code changes.
 */
function resolveMaxFileSize(): number {
	const raw = process.env.MAX_FILE_SIZE_MB;
	if (!raw) return 600 * 1024 * 1024;
	const mb = Number.parseInt(raw, 10);
	if (!Number.isFinite(mb) || mb <= 0) return 600 * 1024 * 1024;
	return mb * 1024 * 1024;
}

export const MAX_FILE_SIZE = resolveMaxFileSize();

/** Allowed MIME type prefixes. Empty array = allow all. */
export const ALLOWED_FILE_PREFIXES: string[] = [
	'image/',
	'video/',
	'audio/',
	'text/',
	'application/pdf',
	'application/json',
	'application/zip',
	'application/x-tar',
	'application/gzip',
	'application/octet-stream',
	'application/msword',
	'application/vnd.openxmlformats-officedocument',
	'application/vnd.ms-excel',
	'application/vnd.ms-powerpoint'
];

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
