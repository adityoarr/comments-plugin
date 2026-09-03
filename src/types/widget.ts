/**
 * Strict TypeScript definitions for cross-window communication.
 * Using discriminated unions ensures type safety when parsing messages.
 */
export type WidgetMessageType = 'RESIZE' | 'SCROLL_TO' | 'AUTH_REQUEST';

export type WidgetMessage = 
  | { type: 'RESIZE'; payload: { height: number } }
  | { type: 'SCROLL_TO'; payload: { commentId: string } }
  | { type: 'AUTH_REQUEST'; payload: { action: 'login' | 'logout' } };