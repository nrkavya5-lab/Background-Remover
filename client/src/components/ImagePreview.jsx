import { useState } from 'react';

export default function ImagePreview({ src, alt, onReset }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="relative group">
      <div
        className={`relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800
          ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={src}
          alt={alt || 'Preview'}
          className={`w-full object-contain transition-transform duration-200 ${zoomed ? 'scale-150' : 'scale-100'}`}
          style={{ maxHeight: zoomed ? 'none' : '400px' }}
        />
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <p className="mt-1 text-xs text-gray-400 text-center">
        {zoomed ? 'Click to zoom out' : 'Click to zoom in'}
      </p>
    </div>
  );
}
