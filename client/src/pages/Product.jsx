import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import ProcessingOverlay from '../components/ProcessingOverlay';

export default function Product() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [noBgPath, setNoBgPath] = useState(null);
  const [resultPath, setResultPath] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [effect, setEffect] = useState('none');

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

  const process = async () => {
    if (!file) return;
    setProcessing(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const uploadRes = await api.post('/api/upload', form);
      const bgRes = await api.post('/api/remove-bg', { imagePath: uploadRes.data.path });
      let currentPath = bgRes.data.path;

      if (bgColor && bgColor !== 'transparent') {
        const replaceRes = await api.post('/api/replace-bg', { imagePath: currentPath, color: bgColor });
        currentPath = replaceRes.data.path;
      }

      if (effect === 'shadow') {
        const shadowRes = await api.post('/api/product/shadow', { imagePath: currentPath });
        currentPath = shadowRes.data.path;
      } else if (effect === 'reflection') {
        const reflRes = await api.post('/api/product/reflection', { imagePath: currentPath });
        currentPath = reflRes.data.path;
      }

      setNoBgPath(bgRes.data.path);
      setResultPath(currentPath);
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      {processing && <ProcessingOverlay status="Processing..." />}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Photo Creator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create professional product photos.</p>
        </div>

        {!preview && (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}>
            <input {...getInputProps()} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Upload a product photo</p>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <img src={preview} alt="" className="w-full max-h-48 object-contain rounded-xl border" />
              </div>
              {resultPath && (
                <div className="flex-1 min-w-0">
                  <img src={resultPath} alt="" className="w-full max-h-48 object-contain rounded-xl border" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Color</label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm font-mono" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Effect</label>
                <select value={effect} onChange={(e) => setEffect(e.target.value)} className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
                  <option value="none">None</option>
                  <option value="shadow">Drop Shadow</option>
                  <option value="reflection">Reflection</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setFile(null); setPreview(null); setNoBgPath(null); setResultPath(null); }}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                New Photo
              </button>
              <button onClick={process}
                className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600">
                {resultPath ? 'Re-Process' : 'Create Product Photo'}
              </button>
            </div>

            {resultPath && (
              <a href={resultPath} download="product-photo.png"
                className="block w-full py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 text-center">
                Download HD Product Photo
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
