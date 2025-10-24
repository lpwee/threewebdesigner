/**
 * @context7-library /threewebdesigner/workers/handler
 * @description Main Cloudflare Worker entry point
 * @version 1.0.0
 * 
 * From PRD 05, Section 6: Worker Configuration
 * Routes requests to appropriate handlers and manages CORS
 */

import type { WorkerRequest, WorkerEnv } from '@/types';
import { generateModelAgent } from './agents/modelGeneration';
import { getCORSHeaders, handleCORSPreflight } from '@/lib/api-helpers';
import { validateGenerateModelRequest } from '@/lib/validation';
import { Errors, errorResponse } from '@/lib/api-helpers';
import { logger } from './utils/logger';

/**
 * Main worker request handler
 * From PRD 05, Section 3: API Design
 */
export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const startTime = Date.now();

    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return handleCORSPreflight(request);
      }

      const url = new URL(request.url);
      const pathname = url.pathname;

      // Log request
      logger.info('Incoming request', {
        method: request.method,
        path: pathname,
        userAgent: request.headers.get('user-agent'),
      });

      // Route to appropriate handler
      if (pathname === '/api/generate-model' && request.method === 'POST') {
        return await handleGenerateModel(request, env);
      }

      if (pathname.match(/^\/api\/model\/[^/]+$/) && request.method === 'GET') {
        return await handleGetModel(request, env);
      }

      if (pathname === '/api/animation-config' && request.method === 'POST') {
        return await handleAnimationConfig(request, env);
      }

      // 404 response
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders(request.headers.get('origin') || ''),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Worker error', { error: message });

      return errorResponse(new Error(message), 500);
    }
  },
};

/**
 * Handle POST /api/generate-model
 * From PRD 02, Section 2.1 & PRD 05, Section 3.1
 */
async function handleGenerateModel(
  request: Request,
  env: WorkerEnv
): Promise<Response> {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateGenerateModelRequest(body);
    if (!validation.success) {
      return errorResponse(
        new Error(`Validation failed: ${JSON.stringify(validation.details)}`),
        400
      );
    }

    const { prompt, quality = 'medium', style = 'stylized' } = validation.data;

    // Log generation start
    logger.info('Starting model generation', {
      promptLength: prompt.length,
      quality,
      style,
    });

    // Call agent to generate model
    const result = await generateModelAgent(
      {
        prompt,
        quality,
        style,
      },
      env
    );

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log success
    logger.info('Model generation successful', {
      modelId: result.modelId,
      responseTime,
      polyCount: result.metadata.polyCount,
    });

    // Return response with CORS headers
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${env.MODEL_CACHE_TTL || 86400}`,
        'X-Generation-Time': `${responseTime}ms`,
        ...getCORSHeaders(request.headers.get('origin') || ''),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    logger.error('Model generation error', { error: message });

    return errorResponse(new Error(message), 500);
  }
}

/**
 * Handle GET /api/model/:modelId
 * Retrieves cached model
 */
async function handleGetModel(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const url = new URL(request.url);
    const modelId = url.pathname.split('/').pop();

    if (!modelId) {
      return errorResponse(Errors.modelNotFound('undefined'), 404);
    }

    // Get from cache
    const cached = await env.MODELS_CACHE.get(`model:${modelId}`, 'json');

    if (!cached) {
      return errorResponse(Errors.modelNotFound(modelId), 404);
    }

    logger.info('Cache hit', { modelId });

    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'HIT',
        ...getCORSHeaders(request.headers.get('origin') || ''),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve model';
    return errorResponse(new Error(message), 500);
  }
}

/**
 * Handle POST /api/animation-config
 * Returns animation suggestions
 */
async function handleAnimationConfig(
  request: Request,
  env: WorkerEnv
): Promise<Response> {
  try {
    const body = await request.json();
    const { modelId, scrollBehavior } = body;

    if (!modelId) {
      return errorResponse(new Error('modelId is required'), 400);
    }

    // Get model from cache
    const model = await env.MODELS_CACHE.get(`model:${modelId}`, 'json');

    if (!model) {
      return errorResponse(Errors.modelNotFound(modelId), 404);
    }

    // Return animation config
    const config = {
      modelId,
      animations: model.animations?.suggestions || [],
      scrollBehavior: scrollBehavior || {
        start: '0%',
        end: '100%',
      },
    };

    return new Response(JSON.stringify({ config }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders(request.headers.get('origin') || ''),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get animation config';
    return errorResponse(new Error(message), 500);
  }
}
