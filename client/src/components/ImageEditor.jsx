import { useState, useCallback, useRef } from 'react';
import api from '../services/api';

const TABS = [
  { key: 'crop', label: 'Crop' },
  { key: 'resize', label: 'Resize' },
  { key: 'rotate', label: 'Rotate' },
  { key: 'adjust', label: 'Adjust' },
];

const FIT_OPTIONS = ['cover', 'contain', 'fill', 'inside', 'outside'];

export default function ImageEditor({ imagePath, onComplete, onClose }) {
  const [tab, setTab] = useState('resize');
  const [applying, setApplying] = useState(false);
  const imgRef = useRef(null);

  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [resize, setResize] = useState({ width: '', height: '', fit: 'cover' });
  const [rotate, setRotate] = useState(0);
  const [adjust, setAdjust] = useState({ brightness: 1, contrast: 1, blur: 0 });

  const resetSection = (section) => {
    if (section === 'crop') setCrop({ x: 0, y: 0, width: 100, height: 100 });
    if (section === 'resize') setResize({ width: '', height: '', fit: 'cover' });
    if (section === 'rotate') setRotate(0);
    if (section === 'adjust') setAdjust({ brightness: 1, contrast: 1, blur: 0 });
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      let currentPath = imagePath;
      let res;

      if (tab === 'crop') {
        res = await api.post('/api/edit/crop', { imagePath: currentPath, ...crop });
        currentPath = res.data.path;
      } else if (tab === 'resize' && resize.width && resize.height) {
        res = await api.post('/api/edit/resize', { imagePath: currentPath, ...resize });
        currentPath = res.data.path;
      } else if (tab === 'rotate') {
        res = await api.post('/api/edit/rotate', { imagePath: currentPath, degrees: rotate });
        currentPath = res.data.path;
      } else if (tab === 'adjust') {
        res = await api.post('/api/edit/adjust', { imagePath: currentPath, ...adjust });
        currentPath = res.data.path;
      }

      if (res) onComplete(res.data);
    } catch (err) {
      console.error('Edit failed:', err);
    }
    setApplying(false);
  };

  const cssFilter = `brightness(${adjust.brightness}) contrast(${adjust.contrast}) blur(${adjust.blur}px)`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Image Editor</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors
              ${tab === t.key
                ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <img
          ref={imgRef}
          src={imagePath}
          alt="Edit preview"
          className="w-full object-contain transition-all duration-200"
          style={{
            maxHeight: '250px',
            transform: `rotate(${rotate}deg)`,
            filter: cssFilter,
          }}
        />
      </div>

      {tab === 'crop' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Set crop area as percentage of image dimensions.</p>
          {['x', 'y', 'width', 'height'].map((axis) => (
            <div key={axis}>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">{axis}</label>
              <input
                type="range"
                min="0"
                max={axis === 'width' || axis === 'height' ? 100 : 50}
                value={crop[axis]}
                onChange={(e) => setCrop({ ...crop, [axis]: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {tab === 'resize' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Width (px)</label>
              <input
                type="number"
                value={resize.width}
                onChange={(e) => setResize({ ...resize, width: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm"
                placeholder="800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Height (px)</label>
              <input
                type="number"
                value={resize.height}
                onChange={(e) => setResize({ ...resize, height: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm"
                placeholder="600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Fit</label>
            <select
              value={resize.fit}
              onChange={(e) => setResize({ ...resize, fit: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm"
            >
              {FIT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {tab === 'rotate' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="-180"
              max="180"
              value={rotate}
              onChange={(e) => setRotate(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-mono w-12 text-right">{rotate}°</span>
          </div>
          <div className="flex gap-2">
            {[-90, -45, 45, 90].map((deg) => (
              <button
                key={deg}
                onClick={() => setRotate(deg)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors
                  ${rotate === deg
                    ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'adjust' && (
        <div className="space-y-3">
          {[
            { key: 'brightness', label: 'Brightness', min: 0, max: 2, step: 0.01 },
            { key: 'contrast', label: 'Contrast', min: 0, max: 3, step: 0.01 },
            { key: 'blur', label: 'Blur', min: 0, max: 20, step: 0.1 },
          ].map(({ key, label, min, max, step }) => (
            <div key={key}>
              <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                <span>{label}</span>
                <span>{adjust[key]}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={adjust[key]}
                onChange={(e) => setAdjust({ ...adjust, [key]: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => resetSection(tab)}
          className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          disabled={applying}
          className="flex-1 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
        >
          {applying ? 'Applying...' : 'Apply'}
        </button>
      </div>
    </div>
  );
}
