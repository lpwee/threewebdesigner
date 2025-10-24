/**
 * @context7-library /threewebdesigner/workers/tools/animations
 * @description Animation suggestion generation
 * @version 1.0.0
 * 
 * From PRD 03, Section 3: Tool 3 - suggest_animations
 */

import type { ScrollAnimation, ModelMetadata } from '@/types';

export class AnimationSuggestionTool {
  /**
   * Suggest animations based on model
   * From PRD 03, Section 3: Tool 3
   */
  async suggestAnimations(
    metadata: ModelMetadata,
    prompt: string
  ): Promise<ScrollAnimation[]> {
    const suggestions: ScrollAnimation[] = [];

    // Analyze prompt for animation hints
    const hasRotationHint = /spin|rotate|turn|circular/.test(prompt.toLowerCase());
    const hasMovementHint = /fly|float|move|drift|drift/.test(prompt.toLowerCase());
    const hasScaleHint = /grow|shrink|expand|pulse/.test(prompt.toLowerCase());

    // Suggest rotation animation
    if (hasRotationHint || metadata.polyCount > 3000) {
      suggestions.push({
        name: 'Primary Rotation',
        type: 'rotation',
        axis: 'y',
        duration: 8000,
        easing: 'linear',
        intensity: 1,
        description: 'Gentle Y-axis rotation synchronized with scroll',
      });
    }

    // Suggest movement animation
    if (hasMovementHint) {
      suggestions.push({
        name: 'Floating Motion',
        type: 'translation',
        axis: 'z',
        duration: 6000,
        easing: 'ease-in-out',
        intensity: 0.5,
        description: 'Subtle Z-axis floating motion',
      });
    }

    // Suggest scale animation
    if (hasScaleHint || metadata.polyCount < 2000) {
      suggestions.push({
        name: 'Scale Pulse',
        type: 'scale',
        duration: 4000,
        easing: 'ease-out',
        intensity: 0.2,
        description: 'Gentle scale pulsing effect',
      });
    }

    // Always include default rotation if no other suggestions
    if (suggestions.length === 0) {
      suggestions.push({
        name: 'Default Rotation',
        type: 'rotation',
        axis: 'y',
        duration: 10000,
        easing: 'linear',
        intensity: 0.8,
        description: 'Default smooth rotation around Y axis',
      });
    }

    return suggestions;
  }
}
