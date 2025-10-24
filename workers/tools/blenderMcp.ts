/**
 * @context7-library /threewebdesigner/workers/tools/blenderMcp
 * @description Blender MCP server integration tool
 * @version 1.0.0
 * 
 * From PRD 03, Section 3: Tool 1 - blender_mcp_generate_model
 */

import type { BlenderMCPRequest, BlenderMCPResponse, ModelSpecification, WorkerEnv } from '@/types';

export class BlenderMCPTool {
  private blenderUrl: string;

  constructor(env: WorkerEnv) {
    this.blenderUrl = env.BLENDER_MCP_URL;
  }

  /**
   * Generate model via Blender MCP server
   * From PRD 03, Section 3: Tool 1
   */
  async generateModel(spec: ModelSpecification): Promise<BlenderMCPResponse> {
    const request: BlenderMCPRequest = {
      prompt: spec.prompt,
      quality: spec.quality,
      style: spec.style,
      complexity: spec.complexity,
      targetPolyCount: spec.targetPolyCount,
      timeout: spec.timeout,
    };

    try {
      const response = await fetch(`${this.blenderUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Blender MCP error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to call Blender MCP: ${error}`);
    }
  }
}
