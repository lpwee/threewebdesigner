/**
 * @context7-library /threewebdesigner/lib/api-helpers
 * @description API response and error handling helpers
 * @version 1.0.0
 * 
 * Implements from PRD 02 Section 2.3 and PRD 05 Section 3
 * - Standardized API responses
 * - Error handling and formatting
 * - Success responses with proper structure
 */

import type { GenerateModelResponse, ErrorResponse, ModelMetadata, ScrollAnimation } from '@/types';

/**
 * ============================================================================
 * SUCCESS RESPONSE BUILDERS
 * ============================================================================
 */

/**
 * Build a successful JSON response with proper status code
 */
export function jsonResponse<T>(data: T, statusCode: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

/**
 * Build a streaming response for large models
 */
export function streamResponse(
  stream: ReadableStream,
  statusCode: number = 200,
  contentType: string = 'application/octet-stream'
): Response {
  return new Response(stream, {
    status: statusCode,
    headers: {
      'Content-Type': contentType,
      'Transfer-Encoding': 'chunked',
    },
  });
}

/**
 * ============================================================================
 * ERROR RESPONSE BUILDERS
 * ============================================================================
 * From PRD 02 Section 2.3: Error Handling
 */

export class APIError extends Error {
  constructor(
    public message: string,
    public code: ErrorResponse['code'],
    public statusCode: number,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Create an error response object
 * From PRD 05 Section 3: Error Codes
 */
export function createErrorResponse(
  error: Error | APIError | string,
  statusCode?: number
): ErrorResponse {
  if (error instanceof APIError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      suggestions: error.suggestions,
    };
  }

  const message = error instanceof Error ? error.message : String(error);

  // Determine error type and code
  let code: ErrorResponse['code'] = 'GENERATION_FAILED';
  let code_statusCode = statusCode || 500;

  if (message.includes('timeout') || message.includes('timed out')) {
    code = 'TIMEOUT';
    code_statusCode = 504;
  } else if (message.includes('validation') || message.includes('invalid')) {
    code = 'INVALID_PROMPT';
    code_statusCode = 400;
  } else if (message.includes('rate limit') || message.includes('too many')) {
    code = 'RATE_LIMIT';
    code_statusCode = 429;
  }

  return {
    error: message,
    code,
    statusCode: code_statusCode,
  };
}

/**
 * Send an error response with proper HTTP status
 */
export function errorResponse(error: Error | APIError | string, statusCode?: number): Response {
  const errorObj = createErrorResponse(error, statusCode);

  return new Response(JSON.stringify(errorObj), {
    status: errorObj.statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * ============================================================================
 * ERROR CREATION HELPERS
 * ============================================================================
 * From PRD 02 Section 2.3: Graceful failures with descriptive error messages
 */

export const Errors = {
  invalidPrompt: (details?: string) =>
    new APIError(
      details || 'The prompt is invalid or missing required fields',
      'INVALID_PROMPT',
      400,
      [
        'Ensure the prompt is between 1 and 5000 characters',
        'Remove any special characters if present',
        'Try a simpler, more descriptive prompt',
      ]
    ),

  generationFailed: (reason?: string) =>
    new APIError(
      reason || 'Model generation failed. Please try again.',
      'GENERATION_FAILED',
      500,
      [
        'Try with a simpler or more specific prompt',
        'Try a lower quality setting (low/medium instead of high)',
        'Check that all parameters are valid',
      ]
    ),

  timeout: () =>
    new APIError(
      'Model generation timed out. This typically means the model is too complex.',
      'TIMEOUT',
      504,
      [
        'Try with a simpler prompt (fewer objects/details)',
        'Try with a lower quality setting (low instead of medium/high)',
        'Try with a different style (abstract instead of realistic)',
      ]
    ),

  rateLimit: (retryAfter?: number) =>
    new APIError(
      `Rate limit exceeded. Maximum 10 requests per minute allowed.`,
      'RATE_LIMIT',
      429,
      retryAfter ? [`Please wait ${retryAfter} seconds before retrying`] : undefined
    ),

  modelNotFound: (modelId: string) =>
    new APIError(
      `Model with ID "${modelId}" not found or has expired (24-hour cache TTL)`,
      'NOT_FOUND',
      404,
      ['Try generating the model again', 'Check that the model ID is correct']
    ),

  invalidQuality: () =>
    new APIError(
      'Invalid quality setting. Must be "low", "medium", or "high".',
      'INVALID_PROMPT',
      400
    ),

  invalidStyle: () =>
    new APIError(
      'Invalid style setting. Must be "realistic", "stylized", or "abstract".',
      'INVALID_PROMPT',
      400
    ),

  fileTooLarge: (size: number) =>
    new APIError(
      `Generated model file is too large (${(size / 1024 / 1024).toFixed(2)}MB). Max size is 50MB.`,
      'GENERATION_FAILED',
      413,
      ['Try with lower quality settings', 'Try with a simpler model description']
    ),

  blenderServerError: (reason?: string) =>
    new APIError(
      reason || 'Blender MCP server is temporarily unavailable',
      'GENERATION_FAILED',
      503,
      ['Try again in a few moments', 'Try with a simpler prompt']
    ),
};

/**
 * ============================================================================
 * REQUEST/RESPONSE LOGGING
 * ============================================================================
 */

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number; // milliseconds
  error?: string;
  userAgent?: string;
}

/**
 * Create a request log entry
 */
export function createRequestLog(
  request: Request,
  statusCode: number,
  responseTimeMs: number,
  error?: string
): RequestLog {
  const url = new URL(request.url);

  return {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    statusCode,
    responseTime: responseTimeMs,
    error,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

/**
 * ============================================================================
 * CORS & HEADER HELPERS
 * ============================================================================
 */

/**
 * Get CORS headers for cross-origin requests
 * From PRD 02 Section 5.2: Implement CORS policies
 */
export function getCORSHeaders(origin?: string): Record<string, string> {
  // In production, you'd validate the origin against an allowlist
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:8787', 'https://threewebdesigner.com'];

  const originToUse = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': originToUse,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleCORSPreflight(request: Request): Response {
  const origin = request.headers.get('origin') || '';

  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(origin),
  });
}

/**
 * ============================================================================
 * RESPONSE BUILDERS WITH PROPER FORMATTING
 * ============================================================================
 */

/**
 * Build a formatted success response for model generation
 * From PRD 05 Section 3.1: Response format
 */
export function buildGenerateModelResponse(
  modelId: string,
  modelData: { format: 'glb' | 'gltf'; data: string },
  metadata: ModelMetadata,
  animations: ScrollAnimation[]
): Response {
  const response: GenerateModelResponse = {
    modelId,
    modelData,
    metadata,
    animations: { suggestions: animations },
  };

  return jsonResponse(response, 200);
}

/**
 * Add timing headers to response
 */
export function addTimingHeaders(
  response: Response,
  generationTimeMs: number
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Generation-Time', `${generationTimeMs}ms`);
  headers.set('Server-Timing', `generation;dur=${generationTimeMs}`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * ============================================================================
 * CACHING HEADERS
 * ============================================================================
 * From PRD 02 Section 4.2: Cache strategy
 */

export function getCacheHeaders(ttlSeconds: number = 86400): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${ttlSeconds}`,
    'CDN-Cache-Control': `max-age=${ttlSeconds}`,
    'Cloudflare-Cache-On-Cookie': 'session_id', // Cache even with cookies
  };
}

export function getNoCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}
