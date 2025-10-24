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
import type { GenerationOptions } from '@/types';

type PageState = 'empty' | 'loading' | 'success' | 'error';

export default function Home() {
  const [pageState, setPageState] = useState<PageState>('empty');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState<'Generating' | 'Converting' | 'Optimizing' | undefined>();

  // Simulate model generation
  const handleGenerate = useCallback(async (userPrompt: string, options: GenerationOptions) => {
    setLoading(true);
    setPageState('loading');
    setError(null);
    setGenerationProgress(0);

    try {
      // Log the generation parameters (using them to avoid unused warnings)
      console.log('Generating model with prompt:', userPrompt, 'options:', options);
      
      // Simulate API call with progress
      const stages: Array<'Generating' | 'Converting' | 'Optimizing'> = ['Generating', 'Converting', 'Optimizing'];
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
      <main className="min-h-screen pt-24 pb-16">
        <div className="container max-w-7xl">
          {pageState === 'empty' && (
            <>
              {/* Quick Prompts */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-white">Try these examples</h2>
                <QuickPrompts onSelectPrompt={handleSelectQuickPrompt} />
              </section>

              {/* Main Editor Area */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Input */}
                <div className="flex flex-col gap-6">
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold mb-6 text-white">Create Your Model</h3>
                    <PromptInput
                      value={prompt}
                      onChange={setPrompt}
                      onGenerate={handleGenerate}
                      isLoading={loading}
                      error={error || undefined}
                    />
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="flex flex-col gap-6">
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold mb-6 text-white">Preview</h3>
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
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* Left: Model Viewer */}
                <div className="flex flex-col gap-6">
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold mb-6 text-white">Your Model</h3>
                    <ThreeJsCanvas
                      isLoading={false}
                      autoRotate={true}
                    />
                  </div>
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
                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold mb-6 text-white">Model Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                        <p className="text-sm text-slate-400 font-medium">Polygon Count</p>
                        <p className="text-xl font-mono text-cyan-400 font-bold">5,000</p>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                        <p className="text-sm text-slate-400 font-medium">Texture Maps</p>
                        <p className="text-xl font-mono text-cyan-400 font-bold">2</p>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <p className="text-sm text-slate-400 font-medium">File Size</p>
                        <p className="text-xl font-mono text-cyan-400 font-bold">2.5 MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold mb-4 text-white">Your Prompt</h3>
                    <p className="text-slate-300 leading-relaxed">
                      {prompt}
                    </p>
                  </div>

                  <button
                    onClick={handleReset}
                    className="btn btn-primary w-full text-lg py-4"
                  >
                    Create Another Model
                  </button>
                </div>
              </section>

              {/* Scroll Animation Preview */}
              <section className="py-16">
                <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-12 shadow-xl">
                  <h3 className="text-3xl font-bold mb-8 text-white text-center">Scroll Animation Preview</h3>
                  <div className="text-center text-slate-500 text-lg">
                    Scroll animation component will be rendered here
                  </div>
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
      <section className="py-24 border-t border-slate-800/50">
        <div className="container max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Powerful Features</h2>
            <p className="text-xl text-slate-400">Everything you need to create stunning 3D models</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-all shadow-xl">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI-Powered</h3>
              <p className="text-slate-400 leading-relaxed">Advanced AI generates 3D models from your text descriptions instantly.</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-all shadow-xl">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Fast & Responsive</h3>
              <p className="text-slate-400 leading-relaxed">Cloud-based generation with real-time progress updates.</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-all shadow-xl">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Interactive</h3>
              <p className="text-slate-400 leading-relaxed">Explore your models with intuitive 3D controls and animations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="container max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-lg">3D</span>
              </div>
              <span className="font-bold text-lg text-white">ThreeWebDesigner</span>
            </div>
            <p className="text-slate-500 text-sm">&copy; 2025 ThreeWebDesigner. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">Privacy</a>
              <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">Terms</a>
              <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
