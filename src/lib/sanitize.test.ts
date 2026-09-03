/// <reference types="jest" />

import { sanitizeContentServer, sanitizeContentClient, stripHtml, isValidUrl } from './sanitize';

describe('Content Sanitization', () => {
  describe('sanitizeContentServer', () => {
    it('should allow safe HTML tags', () => {
      const input = '<b>Bold</b> and <i>italic</i>';
      expect(sanitizeContentServer(input)).toBe('<b>Bold</b> and <i>italic</i>');
    });

    it('should strip script tags', () => {
      const input = '<script>alert("xss")</script><p>Safe</p>';
      expect(sanitizeContentServer(input)).toBe('<p>Safe</p>');
    });

    it('should strip event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      expect(sanitizeContentServer(input)).toBe('<div>Click me</div>');
    });

    it('should validate href protocols', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeContentServer(input);
      expect(result).not.toContain('javascript:');
    });

    it('should add rel="noopener noreferrer" to links', () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeContentServer(input);
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('target="_blank"');
    });

    it('should handle empty input', () => {
      expect(sanitizeContentServer('')).toBe('');
    });
  });

  describe('sanitizeContentClient', () => {
    it('should sanitize content on client', () => {
      const input = '<script>alert(1)</script><p>Safe</p>';
      expect(sanitizeContentClient(input)).toBe('<p>Safe</p>');
    });
  });

  describe('stripHtml', () => {
    it('should remove all HTML tags', () => {
      expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
    });

    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('should allow http and https', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should reject javascript protocol', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });
  });
});