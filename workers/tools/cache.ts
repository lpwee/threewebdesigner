/**
 * @context7-library /threewebdesigner/workers/tools/cache
 * @description Cloudflare KV caching operations
 * @version 1.0.0
 * 
 * From PRD 03, Section 3: Tool 4 - cache_model_data
 */

import type { GenerateModelResponse, WorkerEnv } from '@/types';

export class CacheTool {
  private kv: KVNamespace;
  private ttl: number;

  constructor(env: WorkerEnv) {
    this.kv = env.MODELS_CACHE;
    this.ttl = parseInt(env.MODEL_CACHE_TTL || '86400');
  }

  /**
   * Get cached model
   */
  async get(key: string): Promise<GenerateModelResponse | null> {
    try {
      const data = await this.kv.get(`model:${key}`, 'json');
      return data as GenerateModelResponse | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Cache model data
   * From PRD 03, Section 3: Tool 4
   */
  async set(key: string, data: GenerateModelResponse): Promise<boolean> {
    try {
      await this.kv.put(`model:${key}`, JSON.stringify(data), {
        expirationTtl: this.ttl,
      });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached model
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.kv.delete(`model:${key}`);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }
}
