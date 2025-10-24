'use client';

/**
 * @context7-library /threewebdesigner/app/page
 * @description Main landing page
 * @version 1.0.0
 * 
 * From PRD 04, Section 2: Component Hierarchy & Layout
 */

import React, { useState, useCallback } from 'react';
import {
  Hero,
  Navigation,
  PromptInput,
  QuickPrompts,
  ThreeJsCanvas,
  LoadingState,
  ErrorState,
  ModelControls,
} from '@/app/components';

type PageState = 'empty' | 'loading' | 'success' | 'error';

export default function Home() {
  const [pageState, setPageState] = useState<PageState>('empty');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState<string | undefined>();

  // Simulate model generation
  const handleGenerate = useCallback(async (userPrompt: string, options: any) => {
    setLoading(true);
    setPageState('loading');
    setError(null);
    setGenerationProgress(0);

    try {
      // Simulate API call with progress
      const stages = ['Generating', 'Converting', 'Optimizing'];
      for (let i = 0; i < stages.length; i++) {
        setGenerationStage(stages[i]);
        for (let progress = 0; progress <= 33; progress += 5) {
          setGenerationProgress(Math.min(i * 33 + progress, 99));
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Complete
      setGenerationProgress(100);
      setGenerationStage(undefined);
      setPageState('success');
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate model';
      setError(message);
      setPageState('error');
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setPageState('loading');
  }, []);

  const handleSelectQuickPrompt = useCallback((quickPrompt: string) => {
    setPrompt(quickPrompt);
  }, []);

  const handleReset = useCallback(() => {
    setPageState('empty');
    setPrompt('');
    setError(null);
    setGenerationProgress(0);
  }, []);

  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <main className="min-h-screen pt-20 pb-10">
        <div className="container max-w-6xl">
          {pageState === 'empty' && (
            <>
              {/* Quick Prompts */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Try these examples</h2>
                <QuickPrompts onSelectPrompt={handleSelectQuickPrompt} />
              </section>

              {/* Main Editor Area */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Input */}
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Create Your Model</h3>
                    <PromptInput
                      value={prompt}
                      onChange={setPrompt}
                      onGenerate={handleGenerate}
                      isLoading={loading}
                      error={error}
                    />
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Preview</h3>
                    <ThreeJsCanvas
                      isLoading={loading}
                      error={error || undefined}
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {pageState === 'loading' && (
            <section className="flex items-center justify-center min-h-[500px]">
              <LoadingState
                progress={generationProgress}
                stage={generationStage}
                estimatedTime={30}
              />
            </section>
          )}

          {pageState === 'success' && (
            <>
              {/* Success Content */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Left: Model Viewer */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-semibold">Your Model</h3>
                  <ThreeJsCanvas
                    isLoading={false}
                    autoRotate={true}
                  />
                  <ModelControls
                    onReset={handleReset}
                    onRotateX={() => {}}
                    onRotateY={() => {}}
                    onDownload={() => {}}
                    modelInfo={{
                      polyCount: 5000,
                      textures: 2,
                      size: '2.5 MB',
                    }}
                  />
                </div>

                {/* Right: Model Info & Actions */}
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Model Information</h3>
                    <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                      <div>
                        <p className="text-xs text-slate-500">Polygon Count</p>
                        <p className="text-lg font-mono text-cyan-400">5,000</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Texture Maps</p>
                        <p className="text-lg font-mono text-cyan-400">2</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">File Size</p>
                        <p className="text-lg font-mono text-cyan-400">2.5 MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Your Prompt</h3>
                    <p className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-slate-300">
                      {prompt}
                    </p>
                  </div>

                  <button
                    onClick={handleReset}
                    className="btn btn-primary w-full"
                  >
                    Create Another Model
                  </button>
                </div>
              </section>

              {/* Scroll Animation Preview */}
              <section className="py-12 border-t border-slate-800">
                <h3 className="text-2xl font-semibold mb-6">Scroll Animation Preview</h3>
                <div className="p-8 bg-slate-900/50 rounded-lg border border-slate-800 text-center text-slate-500">
                  Scroll animation component will be rendered here
                </div>
              </section>
            </>
          )}

          {pageState === 'error' && (
            <section className="flex items-center justify-center min-h-[500px]">
              <ErrorState
                error={error || 'An error occurred'}
                onRetry={handleRetry}
                onSimplifyPrompt={() => {
                  const simplified = prompt
                    .split(' ')
                    .slice(0, Math.ceil(prompt.split(' ').length / 2))
                    .join(' ');
                  setPrompt(simplified);
                  handleRetry();
                }}
              />
            </section>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="py-12 border-t border-slate-800">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">🚀 AI-Powered</h3>
              <p className="text-slate-400">Advanced AI generates 3D models from your text descriptions instantly.</p>
            </div>
            <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">⚡ Fast & Responsive</h3>
              <p className="text-slate-400">Cloud-based generation with real-time progress updates.</p>
            </div>
            <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800">
              <h3 className="text-lg font-semibold mb-2">🎨 Interactive</h3>
              <p className="text-slate-400">Explore your models with intuitive 3D controls and animations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2025 ThreeWebDesigner. All rights reserved.</p>
      </footer>
    </>
  );
}
