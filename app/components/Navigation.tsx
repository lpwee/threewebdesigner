'use client';

/**
 * @context7-library /threewebdesigner/components/Navigation
 * @description Navigation bar component with modern styling
 * @version 1.0.0
 */

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-20 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-lg">3D</span>
          </div>
          <span className="font-bold text-xl text-white">ThreeWebDesigner</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Docs
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            GitHub
          </a>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium">
            Settings
          </button>
        </div>
      </div>
    </nav>
  );
};
