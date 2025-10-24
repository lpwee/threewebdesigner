'use client';

/**
 * @context7-library /threewebdesigner/components/ErrorState
 * @description Error state component with recovery suggestions
 * @version 1.0.0
 * 
 * From PRD 04, Section 3.2: Error State Component
 */

import React from 'react';
import type { ErrorStateProps } from '@/types';

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onSimplifyPrompt,
}) => {
  // Extract error type and suggestions from error message
  const isTimeout = error.toLowerCase().includes('timeout');
  const isGeneration = error.toLowerCase().includes('generation failed');
  const isTooLarge = error.toLowerCase().includes('too large');

  const suggestions: string[] = [];
  if (isTimeout) {
    suggestions.push('Try with a simpler prompt (fewer objects/details)');
    suggestions.push('Try with a lower quality setting');
    suggestions.push('Try with a different style');
  } else if (isTooLarge) {
    suggestions.push('Try with lower quality settings');
    suggestions.push('Simplify your model description');
  } else {
    suggestions.push('Check your prompt for any issues');
    suggestions.push('Try with a different quality or style');
    suggestions.push('Simplify your description');
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Error Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          {isTimeout && 'Generation Timed Out'}
          {isGeneration && 'Generation Failed'}
          {isTooLarge && 'Model Too Large'}
          {!isTimeout && !isGeneration && !isTooLarge && 'Something went wrong'}
        </h3>
        <p className="text-sm text-slate-400 max-w-sm">{error}</p>
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-slate-500 font-semibold mb-3">Try these suggestions:</p>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onRetry}
          className="flex-1 py-2 px-4 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
          aria-label="Retry model generation"
        >
          Try Again
        </button>
        {onSimplifyPrompt && (
          <button
            onClick={onSimplifyPrompt}
            className="flex-1 py-2 px-4 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-900/70 transition-colors"
            aria-label="Simplify prompt and retry"
          >
            Simplify & Retry
          </button>
        )}
      </div>

      {/* Additional Help */}
      <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg max-w-sm">
        <div className="flex gap-2">
          <span className="text-amber-400 mt-0.5">ℹ️</span>
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-1">Need help?</p>
            <p className="text-xs text-slate-500">
              Keep prompts under 100 words, specific with details, and realistic expectations. Check the docs for best practices.
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        className="text-xs text-slate-500 hover:text-slate-400 transition-colors mt-4"
        aria-label="Go back and try again"
      >
        ← Edit your prompt
      </button>
    </div>
  );
};
