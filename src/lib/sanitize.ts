import DOMPurify from 'isomorphic-dompurify';

/**
 * Allowed HTML tags for comment content
 * Security rationale: Only allow formatting tags that don't execute code or load external resources
 */
const ALLOWED_TAGS = [
  'b', 'i', 'strong', 'em', 'code', 'br', 'p',
  'a', 'ul', 'ol', 'li', 'blockquote', 'pre'
];

/**
 * Allowed attributes for HTML tags
 * Security rationale: Only allow href on links, and validate URL protocol
 */
const ALLOWED_ATTR = ['href', 'title', 'class'];

/**
 * Server-side sanitization for API routes
 * Use this before storing content in Firestore
 */
export function sanitizeContentServer(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Configure DOMPurify for server-side use
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });

  // Post-process to add security attributes to links
  // Note: We do this after sanitization to avoid DOMPurify hook type issues
  const processed = clean.replace(
    /<a\s+href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    '<a href="$1"$2 rel="noopener noreferrer" target="_blank">'
  );

  return processed;
}

/**
 * Client-side sanitization for preview/rendering
 * Use this when displaying comment content in the widget
 */
export function sanitizeContentClient(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_TRUSTED_TYPE: false
  });
}

/**
 * Strip all HTML tags (for plain text display)
 */
export function stripHtml(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  return content.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate URL format
 * Security rationale: Prevent javascript:, data:, and other dangerous protocols
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}