import { z } from 'zod';

/**
 * Thread ID validation
 * Security rationale: Only allow alphanumeric, hyphens, underscores
 * Prevents path traversal and injection attacks
 */
export const threadIdSchema = z.string()
  .min(1, 'Thread ID is required')
  .max(100, 'Thread ID too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Thread ID contains invalid characters');

/**
 * Comment content validation
 * Security rationale: Prevent oversized payloads and control characters
 */
export const commentContentSchema = z.string()
  .min(1, 'Comment cannot be empty')
  .max(2000, 'Comment too long (max 2000 characters)')
  .refine(
    (val) => !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(val),
    'Comment contains invalid control characters'
  );

/**
 * Firebase ID Token validation
 */
export const firebaseTokenSchema = z.string()
  .min(10, 'Invalid token format')
  .max(1000, 'Token too long');

/**
 * Cursor validation for pagination
 * Security rationale: Validate Firestore document ID format
 */
export const cursorSchema = z.object({
  cursorTime: z.number().positive('Invalid timestamp'),
  cursorId: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid cursor ID format')
});

/**
 * Create Comment Schema
 */
export const createCommentSchema = z.object({
  threadId: threadIdSchema,
  content: commentContentSchema,
  authorName: z.string().max(50).optional(),
  firebaseIdToken: firebaseTokenSchema,
  siteId: z.string().min(1).max(100).optional(),
});

/**
 * Delete Comment Schema
 */
export const deleteCommentSchema = z.object({
  firebaseIdToken: firebaseTokenSchema,
});

/**
 * Create Thread Schema
 */
export const createThreadSchema = z.object({
  siteId: z.string().min(1).max(100),
  externalThreadId: threadIdSchema,
  firebaseIdToken: firebaseTokenSchema,
});

/**
 * Type exports for use in API routes
 */
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;