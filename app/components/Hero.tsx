'use client';

/**
 * @context7-library /threewebdesigner/components/Hero
 * @description Hero section component with modern flat design
 * @version 1.0.0
 */

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px] text-center gap-8 px-6">
        <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-sm text-cyan-300 font-medium mb-2">
          AI-Powered 3D Generation
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white max-w-4xl leading-tight">
          Create 3D Models with{' '}
          <span className="text-cyan-400">AI</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl font-light">
          Describe what you want to build. Our AI generates stunning 3D models instantly.
        </p>

        <div className="flex gap-4 mt-4">
          <button className="btn btn-primary px-8 py-4 text-lg">
            Get Started
          </button>
          <button className="btn btn-secondary px-8 py-4 text-lg">
            View Examples
          </button>
        </div>
      </div>
    </section>
  );
};
