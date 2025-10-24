/**
 * @context7-library /threewebdesigner/app/api/generate-model
 * @description Frontend API route for model generation
 * @version 1.0.0
 * 
 * From PRD 05, Section 3: API Routes
 * Proxies requests to Cloudflare Worker
 */

import { validateGenerateModelRequest } from '@/lib/validation';
import { errorResponse, jsonResponse } from '@/lib/api-helpers';
import type { GenerateModelRequest } from '@/types';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';

/**
 * POST /api/generate-model
 * Generate a 3D model from a text prompt
 * From PRD 02, Section 2.1
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();

    // Validate request
    const validation = validateGenerateModelRequest(body);
    if (!validation.success) {
      return errorResponse(
        new Error(`Validation failed: ${JSON.stringify(validation.details)}`),
        400
      );
    }

    const { prompt, quality = 'medium', style = 'stylized' } = validation.data as GenerateModelRequest;

    // Call Cloudflare Worker
    const response = await fetch(`${WORKER_URL}/api/generate-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, quality, style }),
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const result = await response.json();

    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    return errorResponse(new Error(message), 500);
  }
}
