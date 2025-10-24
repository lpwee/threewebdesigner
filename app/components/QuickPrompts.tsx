'use client';

/**
 * @context7-library /threewebdesigner/components/QuickPrompts
 * @description Quick prompt suggestions component
 * @version 1.0.0
 */

const prompts = [
  { id: '1', title: 'Vehicles', description: 'Cars, bikes, ships', example: 'A sleek red sports car' },
  { id: '2', title: 'Architecture', description: 'Buildings, structures', example: 'Modern skyscraper' },
  { id: '3', title: 'Nature', description: 'Plants, landscapes', example: 'Floating island' },
  { id: '4', title: 'Gadgets', description: 'Tech devices', example: 'Futuristic headphones' },
];

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          onClick={() => onSelectPrompt(prompt.example)}
          className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-cyan-400 transition text-left group"
        >
          <p className="font-semibold text-sm group-hover:text-cyan-400 transition">{prompt.title}</p>
          <p className="text-xs text-slate-500 mt-1">{prompt.description}</p>
        </button>
      ))}
    </div>
  );
};
