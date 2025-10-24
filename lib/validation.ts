/**
 * @context7-library /threewebdesigner/lib/validation
 * @description Input validation schemas using Zod
 * @version 1.0.0
 * 
 * Implements security requirements from PRD 02, Section 5
 * - Input validation
 * - Prompt sanitization
 * - Rate limiting preparation
 */

import { z } from 'zod';

/**
 * Sanitize user input by removing potentially harmful content
 * From PRD 02 Section 5.1: Sanitize user prompts
 */
export function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * ============================================================================
 * REQUEST SCHEMAS
 * ============================================================================
 */

/**
 * Schema for POST /api/generate-model
 * From PRD 02, Section 2.1
 */
export const GenerateModelRequestSchema = z
  .object({
    prompt: z
      .string()
      .min(1, 'Prompt cannot be empty')
      .max(5000, 'Prompt must be less than 5000 characters')
      .transform(sanitizePrompt),
    quality: z
      .enum(['low', 'medium', 'high'])
      .default('medium')
      .describe('Model quality preference'),
    style: z
      .enum(['realistic', 'stylized', 'abstract'])
      .default('stylized')
      .describe('Model style preference'),
  })
  .strict()
  .describe('Request to generate a 3D model from a text prompt');

export type GenerateModelRequest = z.infer<typeof GenerateModelRequestSchema>;

/**
 * Schema for GET /api/model/:modelId
 */
export const GetModelRequestSchema = z
  .object({
    modelId: z
      .string()
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid model ID format')
      .min(1)
      .max(256),
  })
  .strict();

export type GetModelRequest = z.infer<typeof GetModelRequestSchema>;

/**
 * Schema for POST /api/animation-config
 * From PRD 02, Section 2.1
 */
export const AnimationConfigRequestSchema = z
  .object({
    modelId: z
      .string()
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid model ID format'),
    scrollBehavior: z
      .object({
        start: z.string().regex(/^\d+%$/, 'Start must be a CSS percentage'),
        end: z.string().regex(/^\d+%$/, 'End must be a CSS percentage'),
      })
      .optional(),
  })
  .strict();

export type AnimationConfigRequest = z.infer<typeof AnimationConfigRequestSchema>;

/**
 * ============================================================================
 * RESPONSE SCHEMAS
 * ============================================================================
 */

export const ModelMetadataSchema = z.object({
  polyCount: z.number().int().positive(),
  textureCount: z.number().int().nonnegative(),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    depth: z.number().positive(),
  }),
  fileSize: z.number().int().positive(),
  generationTime: z.number().int().positive(),
  materials: z.array(z.string()),
});

export const ScrollAnimationSchema = z.object({
  name: z.string(),
  type: z.enum(['rotation', 'translation', 'scale', 'material']),
  axis: z.enum(['x', 'y', 'z']).optional(),
  duration: z.number().int().positive(),
  easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out']),
  intensity: z.number().min(0).max(1),
  description: z.string(),
});

export const GenerateModelResponseSchema = z.object({
  modelId: z.string(),
  modelData: z.object({
    format: z.enum(['glb', 'gltf']),
    data: z.string(),
  }),
  metadata: ModelMetadataSchema,
  animations: z.object({
    suggestions: z.array(ScrollAnimationSchema),
  }),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.enum(['INVALID_PROMPT', 'GENERATION_FAILED', 'TIMEOUT', 'RATE_LIMIT', 'NOT_FOUND']),
  suggestions: z.array(z.string()).optional(),
  statusCode: z.number().int(),
});

/**
 * ============================================================================
 * VALIDATION HELPERS
 * ============================================================================
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}

/**
 * Validate and parse generate model request
 * From PRD 02 Section 5.1: Input Validation
 */
export function validateGenerateModelRequest(
  data: unknown
): ValidationResult<GenerateModelRequest> {
  try {
    const validated = GenerateModelRequestSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.reduce(
        (acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );
      return {
        success: false,
        error: 'Validation failed',
        details,
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate animation config request
 */
export function validateAnimationConfigRequest(
  data: unknown
): ValidationResult<AnimationConfigRequest> {
  try {
    const validated = AnimationConfigRequestSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.reduce(
        (acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );
      return {
        success: false,
        error: 'Validation failed',
        details,
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate model ID format
 */
export function validateModelId(modelId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(modelId) && modelId.length > 0 && modelId.length <= 256;
}

/**
 * Validate prompt length and content
 * From PRD 02 Section 5.1: Maximum prompt length enforcement
 */
export function validatePrompt(prompt: string): {
  valid: boolean;
  error?: string;
} {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }
  if (prompt.length > 5000) {
    return {
      valid: false,
      error: `Prompt exceeds maximum length of 5000 characters (current: ${prompt.length})`,
    };
  }
  return { valid: true };
}

/**
 * ============================================================================
 * RATE LIMITING HELPERS
 * ============================================================================
 * From PRD 02 Section 5.1: Rate limiting
 */

export interface RateLimitConfig {
  maxRequests: number; // 10
  windowMs: number; // 60000 (1 minute)
  keyPrefix: string; // 'rate_limit:'
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60000,
  keyPrefix: 'rate_limit:',
};

/**
 * Create a rate limit key for a user/IP
 */
export function createRateLimitKey(identifier: string, config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG): string {
  return `${config.keyPrefix}${identifier}`;
}

/**
 * ============================================================================
 * SECURITY HELPERS
 * ============================================================================
 */

/**
 * Check if model data appears to be a valid GLB/GLTF format
 * From PRD 02 Section 5.2: Output Validation
 */
export function validateModelFormat(data: string, expectedFormat: 'glb' | 'gltf'): boolean {
  try {
    // If it's Base64, decode and check magic bytes
    const buffer = Buffer.from(data, 'base64');

    if (expectedFormat === 'glb') {
      // GLB files start with magic number 0x46546C67 ('glTF' in ASCII)
      return buffer[0] === 0x67 && buffer[1] === 0x6c && buffer[2] === 0x54 && buffer[3] === 0x46;
    }

    // GLTF is JSON, should start with '{'
    return data.trim().startsWith('{');
  } catch {
    return false;
  }
}

/**
 * Generate a model ID hash from prompt for cache key
 * From PRD 02 Section 4.2: Use model hash as cache key
 */
export async function generateModelHash(prompt: string, quality: string, style: string): Promise<string> {
  const combined = `${prompt}:${quality}:${style}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
