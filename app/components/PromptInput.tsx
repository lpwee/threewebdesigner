'use client';

/**
 * @context7-library /threewebdesigner/components/PromptInput
 * @description Prompt input component with quality and style selectors
 * @version 1.0.0
 * 
 * From PRD 04, Section 3.1: Prompt Input Component
 */

import React, { useState, useCallback } from 'react';
import type { PromptInputProps } from '@/types';
import { validatePrompt } from '@/lib/validation';

const PLACEHOLDER_PROMPTS = [
  'A futuristic sports car with neon lights',
  'Floating island with waterfalls',
  'Medieval castle on a hilltop',
  'Minimalist office desk setup',
];

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onGenerate,
  isLoading,
  error,
  maxLength = 5000,
}) => {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [style, setStyle] = useState<'realistic' | 'stylized' | 'abstract'>('stylized');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const characterCount = value.length;
  const percentFilled = (characterCount / maxLength) * 100;

  const validation = validatePrompt(value);

  // Cycle through placeholder prompts
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleGenerate = useCallback(() => {
    if (!validation.valid) {
      return;
    }
    onGenerate(value, { quality, style });
  }, [value, quality, style, validation.valid, onGenerate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (validation.valid) {
        handleGenerate();
      }
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Prompt Textarea */}
      <div className="flex flex-col gap-2">
        <label htmlFor="prompt" className="text-sm font-semibold">
          Describe your 3D model
        </label>
        <div className="relative">
          <textarea
            id="prompt"
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_PROMPTS[placeholderIndex]}
            maxLength={maxLength}
            disabled={isLoading}
            className={`
              w-full p-4 rounded-lg
              bg-slate-900/60 border border-slate-700
              text-white placeholder-slate-500
              focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none min-h-[120px]
              transition-all duration-200
            `}
            aria-describedby={error ? 'prompt-error' : undefined}
            aria-label="Prompt input for 3D model generation"
          />

          {/* Character Counter */}
          <div
            className="absolute bottom-2 right-2 text-xs text-slate-400 flex items-center gap-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>{characterCount}</span>
            <span className="text-slate-600">/</span>
            <span>{maxLength}</span>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-slate-800 rounded-b-lg overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                characterCount > maxLength * 0.9
                  ? 'bg-amber-500'
                  : characterCount > maxLength * 0.7
                    ? 'bg-cyan-400'
                    : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(percentFilled, 100)}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            id="prompt-error"
            className="text-red-400 text-sm flex items-center gap-2"
            role="alert"
          >
            <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
            {error}
          </div>
        )}
      </div>

      {/* Quality and Style Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {/* Quality Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Quality</label>
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                disabled={isLoading}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    quality === q
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400'
                      : 'bg-slate-900/40 border border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                aria-pressed={quality === q}
                title={`Generate ${q} quality model`}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Style</label>
          <div className="flex gap-1">
            {(['realistic', 'stylized', 'abstract'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                disabled={isLoading}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    style === s
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400'
                      : 'bg-slate-900/40 border border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                aria-pressed={style === s}
                title={`Generate ${s} style model`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || !validation.valid || characterCount === 0}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold
          bg-linear-to-r from-cyan-400 to-cyan-600
          text-slate-900
          transition-all duration-200
          hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          flex items-center justify-center gap-2
        `}
        aria-busy={isLoading}
        aria-label="Generate 3D model"
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        )}
        {isLoading ? 'Generating...' : 'Generate Model'}
      </button>

      {/* Keyboard hint */}
      <div className="text-xs text-slate-500 text-center">
        <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded">Ctrl/Cmd</kbd>
        {' '}<kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded">Enter</kbd>
        {' '}to generate
      </div>
    </div>
  );
};
