'use client';

/**
 * @context7-library /threewebdesigner/components/LoadingState
 * @description Loading state component with animated spinner and progress
 * @version 1.0.0
 * 
 * From PRD 04, Section 3.2: Loading State Component
 */

import React, { useEffect, useState } from 'react';
import type { LoadingStateProps } from '@/types';

const STAGES = ['Generating', 'Converting', 'Optimizing'];

export const LoadingState: React.FC<LoadingStateProps> = ({
  progress = 0,
  stage,
  estimatedTime,
}) => {
  const [displayedProgress, setDisplayedProgress] = useState(progress);
  const [currentStage, setCurrentStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Smoothly animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Cycle through stages if not provided
  useEffect(() => {
    if (stage) return;
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % STAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [stage]);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stageText = stage || STAGES[currentStage];
  const remainingTime = estimatedTime ? Math.max(0, estimatedTime - elapsedTime) : null;

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      {/* Animated Spinner */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-cyan-400"
          style={{
            animation: 'spin 1.5s linear infinite',
          }}
        />

        {/* Middle ring */}
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-amber-500 border-l-amber-500"
          style={{
            animation: 'spin 2s linear infinite reverse',
          }}
        />

        {/* Inner dot */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400 to-amber-500 opacity-30 blur" />
      </div>

      {/* Stage indicator */}
      <div className="text-center">
        <p className="text-lg font-semibold text-cyan-400">{stageText}</p>
        <p className="text-sm text-slate-400 mt-2">Please wait while we create your model...</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs text-slate-500 font-mono">{Math.round(displayedProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-500"
            style={{ width: `${Math.min(displayedProgress, 100)}%` }}
            role="progressbar"
            aria-valuenow={Math.round(displayedProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Model generation progress"
          />
        </div>
      </div>

      {/* Time remaining */}
      {remainingTime !== null && (
        <div className="text-sm text-slate-400 text-center">
          {remainingTime > 0 ? (
            <>
              Estimated time remaining: <span className="font-mono text-cyan-400">{remainingTime}s</span>
            </>
          ) : (
            <span className="text-amber-400">Finishing up...</span>
          )}
        </div>
      )}

      {/* Cancel button */}
      <button
        className="mt-4 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:border-slate-600 hover:text-slate-200 transition-colors"
        aria-label="Cancel generation"
      >
        Cancel
      </button>

      {/* Tips */}
      <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg max-w-sm">
        <p className="text-xs text-slate-500 flex items-start gap-2">
          <span className="text-cyan-400 mt-1">💡</span>
          <span>
            {stageText === 'Generating' && 'The AI is creating your 3D model based on your description.'}
            {stageText === 'Converting' && 'Converting the model to web-optimized format for fast loading.'}
            {stageText === 'Optimizing' && 'Optimizing textures and meshes for smooth interaction.'}
          </span>
        </p>
      </div>
    </div>
  );
};
