/**
 * Central API & WebSocket configuration for TypeMaster Web.
 * Automatically adapts between local development and production deployments (e.g. Vercel + AWS).
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export function getWebSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  if (typeof window === 'undefined') {
    return 'ws://localhost:8081/ws';
  }

  // If API_BASE is an absolute URL (e.g. in Vercel pointing to AWS ALB: https://api.typemaster.com/api/v1)
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    try {
      const url = new URL(API_BASE);
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${url.host}/ws`;
    } catch {
      // Fallback below
    }
  }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const defaultHost = window.location.hostname === 'localhost' ? 'localhost:8081' : window.location.host;
  return `${wsProtocol}//${defaultHost}/ws`;
}
