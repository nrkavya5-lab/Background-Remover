import { useState, useRef, useCallback, useEffect } from 'react';

export default function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel, afterLabel }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = useCallback((e) => {
    setDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onTouchStart = useCallback((e) => {
    setDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };
    const onUp = () => setDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, updatePosition]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 select-none cursor-col-resize"
        style={{ userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <img
          src={afterSrc}
          alt={afterLabel || 'After'}
          className="w-full block"
          style={{ maxHeight: '400px', objectFit: 'contain' }}
          draggable={false}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeSrc}
            alt={beforeLabel || 'Before'}
            className="w-full block"
            style={{ maxHeight: '400px', objectFit: 'contain', minWidth: containerRef.current?.offsetWidth }}
            draggable={false}
          />
        </div>
        <div className="absolute inset-y-0" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
          <div className="h-full w-0.5 bg-white shadow-lg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 4m0 0l4 4m-4-4h16" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
        <span>{beforeLabel || 'Original'}</span>
        <span>{afterLabel || 'Result'}</span>
      </div>
    </div>
  );
}
