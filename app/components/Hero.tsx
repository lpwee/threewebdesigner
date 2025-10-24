'use client';

/**
 * @context7-library /threewebdesigner/components/Hero
 * @description Hero section component with animated background
 * @version 1.0.0
 */

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[400px] md:min-h-[500px] overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none" />
      
      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] text-center gap-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-amber-500 bg-clip-text text-transparent">
          Create 3D Models with AI
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl">
          Describe what you want to build. Our AI generates stunning 3D models instantly.
        </p>
        <button className="btn btn-primary">
          Get Started
        </button>
      </div>
    </section>
  );
};
