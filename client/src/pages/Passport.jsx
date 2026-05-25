import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import ProcessingOverlay from '../components/ProcessingOverlay';

const COUNTRY_PRESETS = [
  { name: 'US / Canada', width: 600, height: 600, label: '2×2 inch' },
  { name: 'UK', width: 413, height: 531, label: '35×45 mm' },
  { name: 'India', width: 600, height: 600, label: '2×2 inch' },
  { name: 'EU Passport', width: 472, height: 590, label: '35×45 mm' },
  { name: 'China', width: 433, height: 531, label: '33×48 mm' },
  { name: 'Australia', width: 472, height: 590, label: '35×45 mm' },
];

export default function Passport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [noBgPath, setNoBgPath] = useState(null);
  const [country, setCountry] = useState(COUNTRY_PRESETS[0]);
  const [processing, setProcessing] = useState(false);
  const [resultPath, setResultPath] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length === 0) return;
    setFile(accepted[0]);
    setPreview(URL.createObjectURL(accepted[0]));
    setNoBgPath(null);
    setResultPath(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }, maxFiles: 1, maxSize: 20 * 1024 * 1024,
  });

  const handleRemoveBg = async () => {
    if (!file) return;
    setProcessing(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const uploadRes = await api.post('/api/upload', form);
      const bgRes = await api.post('/api/remove-bg', { imagePath: uploadRes.data.path });
      setNoBgPath(bgRes.data.path);
    } catch {}
    setProcessing(false);
  };

  const handleGenerate = async () => {
    if (!noBgPath) return;
    setProcessing(true);
    try {
      const { data } = await api.post('/api/passport/sheet', {
        imagePath: noBgPath,
        photoWidth: country.width,
        photoHeight: country.height,
      });
      setResultPath(data.path);
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      {processing && <ProcessingOverlay status="Processing..." />}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Passport Photo Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create print-ready passport photos for any country.</p>
        </div>

        {!preview && (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}>
            <input {...getInputProps()} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Upload a portrait photo</p>
          </div>
        )}

        {preview && !noBgPath && (
          <div className="space-y-4">
            <img src={preview} alt="" className="max-h-64 mx-auto rounded-xl" />
            <button onClick={handleRemoveBg} className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600">
              Remove Background
            </button>
          </div>
        )}

        {noBgPath && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center" style={{ minHeight: '200px' }}>
              <img src={noBgPath} alt="" className="max-h-48" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country / Size</label>
              <select
                value={country.name}
                onChange={(e) => setCountry(COUNTRY_PRESETS.find((c) => c.name === e.target.value))}
                className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
              >
                {COUNTRY_PRESETS.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} — {c.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Size: {country.width}×{country.height}px — {country.label}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setFile(null); setPreview(null); setNoBgPath(null); setResultPath(null); }}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                New Photo
              </button>
              <button onClick={handleGenerate}
                className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600">
                Generate Print Sheet
              </button>
            </div>

            {resultPath && (
              <div className="space-y-3">
                <img src={resultPath} alt="Print sheet" className="w-full rounded-xl border" />
                <a href={resultPath} download="passport-sheet.jpg"
                  className="block w-full py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 text-center">
                  Download 4×6 Print Sheet
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
