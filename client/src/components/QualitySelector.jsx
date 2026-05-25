import { QUALITY_PRESETS } from 'shared/utils/constants';

const FORMATS = [
  { value: 'png', label: 'PNG', desc: 'Transparent, lossless' },
  { value: 'jpeg', label: 'JPEG', desc: 'Smaller, opaque' },
  { value: 'webp', label: 'WEBP', desc: 'Modern, efficient' },
];

export default function QualitySelector({ quality, format, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quality</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
            <label
              key={key}
              className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors
                ${quality === preset.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <input
                type="radio"
                name="quality"
                value={preset.value}
                checked={quality === preset.value}
                onChange={() => onChange({ quality: preset.value, format })}
                className="text-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{preset.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{preset.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</label>
        <div className="mt-2 flex gap-2">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => onChange({ quality, format: fmt.value })}
              className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-colors
                ${format === fmt.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <p>{fmt.label}</p>
              <p className="text-xs font-normal text-gray-400 dark:text-gray-500">{fmt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
