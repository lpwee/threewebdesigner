/**
 * @context7-library /threewebdesigner/app/api/model/[id]
 * @description Frontend API route to retrieve cached model
 * @version 1.0.0
 * 
 * From PRD 05, Section 3: API Routes
 */

import { errorResponse, jsonResponse } from '@/lib/api-helpers';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';

/**
 * GET /api/model/:id
 * Retrieve a previously generated model
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;

    if (!id) {
      return errorResponse(new Error('Model ID is required'), 400);
    }

    // Call Cloudflare Worker
    const response = await fetch(`${WORKER_URL}/api/model/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return errorResponse(new Error(`Model not found: ${id}`), 404);
      }
      throw new Error(`Worker error: ${response.status}`);
    }

    const result = await response.json();

    return jsonResponse(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve model';
    return errorResponse(new Error(message), 500);
  }
}
