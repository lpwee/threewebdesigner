'use client';

/**
 * @context7-library /threewebdesigner/components/Navigation
 * @description Navigation bar component
 * @version 1.0.0
 */

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="container flex items-center justify-between h-16">
        <div className="font-bold text-xl text-cyan-400">ThreeWebDesigner</div>
        <div className="flex gap-4">
          <a href="#" className="text-slate-400 hover:text-white transition">Docs</a>
          <a href="#" className="text-slate-400 hover:text-white transition">GitHub</a>
          <button className="text-slate-400 hover:text-white transition">Settings</button>
        </div>
      </div>
    </nav>
  );
};
