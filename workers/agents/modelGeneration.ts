/**
 * @context7-library /threewebdesigner/workers/agents/modelGeneration
 * @description AI Agent for model generation using Claude
 * @version 1.0.0
 * 
 * From PRD 03 - AI Agent Workflow
 * Orchestrates the 6-step workflow with tool invocations
 */

import type { GenerateModelResponse, ModelSpecification, WorkerEnv } from '@/types';
import { generateModelHash } from '@/lib/validation';
import { CONFIG } from '@/types';
import { logger } from '../utils/logger';
import { BlenderMCPTool } from '../tools/blenderMcp';
import { ModelConversionTool } from '../tools/modelConversion';
import { AnimationSuggestionTool } from '../tools/animations';
import { CacheTool } from '../tools/cache';

interface AgentRequest {
  prompt: string;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'stylized' | 'abstract';
}

/**
 * Main agent function that orchestrates the workflow
 * From PRD 03, Section 2: Agent Workflow Steps
 */
export async function generateModelAgent(
  request: AgentRequest,
  env: WorkerEnv
): Promise<GenerateModelResponse> {
  const { prompt, quality, style } = request;

  logger.info('Agent initialized', { quality, style, promptLength: prompt.length });

  // Initialize tools
  const blenderTool = new BlenderMCPTool(env);
  const conversionTool = new ModelConversionTool();
  const animationTool = new AnimationSuggestionTool();
  const cacheTool = new CacheTool(env);

  try {
    // Step 1: Check cache for similar prompts
    // From PRD 03, Section 2 Step 1
    logger.info('Step 1: Checking cache');
    const promptHash = await generateModelHash(prompt, quality, style);
    const cached = await cacheTool.get(promptHash);

    if (cached) {
      logger.info('Cache hit found', { promptHash });
      return cached;
    }

    // Step 2: Analyze prompt and generate specification
    // From PRD 03, Section 2 Step 2
    logger.info('Step 2: Analyzing prompt');
    const spec = analyzePromptAndGenerateSpec(prompt, quality, style);

    // Step 3: Call Blender MCP to generate model
    // From PRD 03, Section 2 Step 3
    logger.info('Step 3: Generating model via Blender MCP', {
      complexity: spec.complexity,
      targetPolyCount: spec.targetPolyCount,
    });

    let blenderResponse;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        blenderResponse = await blenderTool.generateModel(spec);
        break;
      } catch (error) {
        retryCount++;
        if (retryCount > maxRetries) {
          const message = error instanceof Error ? error.message : 'Blender generation failed';
          logger.error('Blender MCP failed after retries', { retryCount, error: message });
          throw new Error(`Model generation failed: ${message}`);
        }

        // Simplify spec for retry
        logger.warn('Blender MCP failed, simplifying spec for retry', { retryCount });
        spec.complexity = Math.max(10, spec.complexity - 20);
        spec.targetPolyCount = Math.max(100, spec.targetPolyCount / 2);
      }
    }

    if (!blenderResponse) {
      throw new Error('Failed to generate model');
    }

    // Step 4: Validate and convert model
    // From PRD 03, Section 2 Step 4
    logger.info('Step 4: Converting and validating model');
    const convertedModel = await conversionTool.convertAndOptimize(
      blenderResponse.modelData,
      blenderResponse.format
    );

    // Step 5: Generate animation suggestions
    // From PRD 03, Section 2 Step 5
    logger.info('Step 5: Generating animation suggestions');
    const animationSuggestions = await animationTool.suggestAnimations(
      convertedModel.metadata,
      prompt
    );

    // Step 6: Cache and return result
    // From PRD 03, Section 2 Step 6
    logger.info('Step 6: Caching result');

    const responseData: GenerateModelResponse = {
      modelId: promptHash,
      modelData: {
        format: 'glb',
        data: convertedModel.data,
      },
      metadata: convertedModel.metadata,
      animations: {
        suggestions: animationSuggestions,
      },
    };

    // Cache the result
    await cacheTool.set(promptHash, responseData);

    logger.info('Agent workflow completed successfully', {
      modelId: promptHash,
      polyCount: convertedModel.metadata.polyCount,
    });

    return responseData;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Agent workflow failed', { error: message });
    throw error;
  }
}

/**
 * Analyze prompt and generate model specification
 * From PRD 03, Section 2 Step 2
 */
function analyzePromptAndGenerateSpec(
  prompt: string,
  quality: 'low' | 'medium' | 'high',
  style: 'realistic' | 'stylized' | 'abstract'
): ModelSpecification {
  // Analyze prompt complexity
  const wordCount = prompt.split(' ').length;
  const hasDetailKeywords = /detailed|complex|intricate|elaborate|refined/.test(prompt.toLowerCase());
  const hasSimpleKeywords = /simple|basic|minimal|clean|smooth/.test(prompt.toLowerCase());

  let complexity = 50; // Base complexity

  // Adjust based on keywords
  if (hasDetailKeywords) complexity += 20;
  if (hasSimpleKeywords) complexity -= 20;

  // Adjust based on word count
  if (wordCount > 50) complexity += 10;
  if (wordCount < 10) complexity -= 10;

  // Clamp complexity
  complexity = Math.max(10, Math.min(100, complexity));

  // Determine quality settings
  const qualitySettings = CONFIG.QUALITY_SETTINGS[quality.toUpperCase() as keyof typeof CONFIG.QUALITY_SETTINGS];

  const spec: ModelSpecification = {
    prompt: prompt.substring(0, 500), // Limit prompt length
    quality,
    style,
    complexity,
    targetPolyCount: qualitySettings.polygons,
    timeout: qualitySettings.timeout,
  };

  logger.info('Generated model specification', { complexity, targetPolyCount: spec.targetPolyCount });

  return spec;
}

/**
 * Tool interface implementations (see separate files)
 * From PRD 03, Section 3: Tool Definitions
 */

export { BlenderMCPTool, ModelConversionTool, AnimationSuggestionTool, CacheTool };
