import { useState } from 'react';

export default function BeforeAfterToggle({ beforeSrc, afterSrc, beforeLabel, afterLabel }) {
  const [showBefore, setShowBefore] = useState(false);

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <img
          src={showBefore ? beforeSrc : afterSrc}
          alt={showBefore ? (beforeLabel || 'Before') : (afterLabel || 'After')}
          className="w-full"
          style={{ maxHeight: '400px', objectFit: 'contain' }}
        />
        <button
          onClick={() => setShowBefore(!showBefore)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 text-white text-sm rounded-full hover:bg-black/75 transition-colors"
        >
          {showBefore ? `Show ${afterLabel || 'Result'}` : `Show ${beforeLabel || 'Original'}`}
        </button>
      </div>
      <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
        {showBefore ? (beforeLabel || 'Original') : (afterLabel || 'Result')}
      </div>
    </div>
  );
}
