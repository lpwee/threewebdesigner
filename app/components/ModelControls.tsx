'use client';

/**
 * @context7-library /threewebdesigner/components/ModelControls
 * @description Model control buttons component
 * @version 1.0.0
 */

import type { ModelControlsProps } from '@/types';

export const ModelControls: React.FC<ModelControlsProps> = ({
  onReset,
  onDownload,
  disabled = false,
}) => {
  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={onReset}
        disabled={disabled}
        className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 hover:border-cyan-400 transition"
      >
        Reset
      </button>
      <button
        onClick={onDownload}
        disabled={disabled}
        className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-400 hover:bg-cyan-500/30 transition"
      >
        Download
      </button>
    </div>
  );
};
