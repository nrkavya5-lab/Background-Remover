import { useState } from 'react';

export default function ResultPreview({ src, alt }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="relative group">
      <div
        className={`relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700
          ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onClick={() => setZoomed(!zoomed)}
        style={{
          backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <img
          src={src}
          alt={alt || 'Processed result'}
          className={`w-full object-contain transition-transform duration-200 ${zoomed ? 'scale-150' : 'scale-100'}`}
          style={{ maxHeight: zoomed ? 'none' : '400px' }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400 text-center">
        {zoomed ? 'Click to zoom out' : 'Click to zoom in'}
      </p>
    </div>
  );
}
