'use client';

/**
 * @context7-library /threewebdesigner/components/ThreeJsCanvas
 * @description Three.js canvas viewer component (stub)
 * @version 1.0.0
 */

import type { ThreeJsCanvasProps } from '@/types';

export const ThreeJsCanvas: React.FC<ThreeJsCanvasProps> = ({
  isLoading,
  error,
}) => {
  return (
    <div className="w-full h-[400px] md:h-[600px] rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!isLoading && !error && (
        <div className="text-slate-500">3D Model Canvas</div>
      )}
    </div>
  );
};
