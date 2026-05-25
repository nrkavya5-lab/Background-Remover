import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF8800', '#8800FF',
  '#FF4488', '#44FF88', '#888888', '#444444', '#F0F0F0',
];

const GRADIENT_PRESETS = [
  { name: 'Sunset', start: '#FF6B6B', end: '#FFE66D' },
  { name: 'Ocean', start: '#2193B0', end: '#6DD5ED' },
  { name: 'Forest', start: '#134E5E', end: '#71B280' },
  { name: 'Midnight', start: '#232526', end: '#414345' },
  { name: 'Candy', start: '#D4145A', end: '#FBB03B' },
  { name: 'Lavender', start: '#8E2DE2', end: '#4A00E0' },
];

const TABS = [
  { key: 'none', label: 'None' },
  { key: 'color', label: 'Color' },
  { key: 'gradient', label: 'Gradient' },
  { key: 'image', label: 'Image' },
];

export default function BackgroundPicker({ onApply, onResetTransparent, disabled }) {
  const [tab, setTab] = useState('none');
  const [color, setColor] = useState('#FFFFFF');
  const [gradient, setGradient] = useState(GRADIENT_PRESETS[0]);
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setBgFile(accepted[0]);
      setBgPreview(URL.createObjectURL(accepted[0]));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 1,
    disabled,
  });

  const handleTabChange = (key) => {
    setTab(key);
    if (key === 'none' && onResetTransparent) {
      onResetTransparent();
    }
  };

  const handleApply = () => {
    if (tab === 'color') onApply({ type: 'color', value: color });
    else if (tab === 'gradient') onApply({ type: 'gradient', startColor: gradient.start, endColor: gradient.end });
    else if (tab === 'image' && bgFile) onApply({ type: 'image', file: bgFile });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">Background</h3>

      <div className="grid grid-cols-4 gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`text-sm font-medium py-1.5 rounded-md transition-colors
              ${tab === t.key
                ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'none' && (
        <div className="py-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transparent background</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No background color — keeps the removed background</p>
        </div>
      )}

      {tab === 'color' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm font-mono"
              placeholder="#000000"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                  ${color === c ? 'border-primary-500 scale-110 ring-2 ring-primary-300' : 'border-gray-300 dark:border-gray-600'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <button
            onClick={handleApply}
            disabled={disabled}
            className="w-full py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            Apply {color}
          </button>
        </div>
      )}

      {tab === 'gradient' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-10 rounded-lg" style={{
              background: `linear-gradient(to right, ${gradient.start}, ${gradient.end})`,
            }} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_PRESETS.map((g) => (
              <button
                key={g.name}
                onClick={() => setGradient(g)}
                className={`h-10 rounded-lg border-2 transition-transform hover:scale-105
                  ${gradient.name === g.name ? 'border-primary-500 ring-2 ring-primary-300' : 'border-gray-300 dark:border-gray-600'}`}
                style={{ background: `linear-gradient(to right, ${g.start}, ${g.end})` }}
                title={g.name}
              />
            ))}
          </div>
          <button
            onClick={handleApply}
            disabled={disabled}
            className="w-full py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            Apply Gradient
          </button>
        </div>
      )}

      {tab === 'image' && (
        <div className="space-y-3">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${bgPreview ? 'border-primary-400' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}>
            <input {...getInputProps()} />
            {bgPreview ? (
              <img src={bgPreview} alt="Background" className="max-h-24 mx-auto rounded" />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Drop or click to upload background image</p>
            )}
          </div>
          <button
            onClick={handleApply}
            disabled={disabled || !bgFile}
            className="w-full py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            Apply Image
          </button>
        </div>
      )}
    </div>
  );
}
