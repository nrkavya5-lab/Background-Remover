import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import ProcessingOverlay from '../components/ProcessingOverlay';

const TEMPLATES = [
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Cover', width: 1640, height: 624 },
  { name: 'Twitter Header', width: 1500, height: 500 },
];

export default function Thumbnail() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [noBgPath, setNoBgPath] = useState(null);
  const [resultPath, setResultPath] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

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
      const { data } = await api.post('/api/thumbnail/generate', {
        imagePath: noBgPath,
        width: template.width,
        height: template.height,
        overlay: { title, subtitle },
      });
      setResultPath(data.path);
    } catch {}
    setProcessing(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      {processing && <ProcessingOverlay status="Generating thumbnail..." />}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Thumbnail Maker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create eye-catching thumbnails with text overlays.</p>
        </div>

        {!preview && (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}>
            <input {...getInputProps()} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Upload an image for your thumbnail</p>
          </div>
        )}

        {preview && !noBgPath && (
          <div className="space-y-4">
            <img src={preview} alt="" className="max-h-48 mx-auto rounded-xl" />
            <button onClick={handleRemoveBg} className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600">
              Remove Background
            </button>
          </div>
        )}

        {noBgPath && (
          <div className="space-y-4">
            {resultPath && (
              <img src={resultPath} alt="" className="w-full rounded-xl border" />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</label>
                <select
                  value={template.name}
                  onChange={(e) => setTemplate(TEMPLATES.find((t) => t.name === e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.name} value={t.name}>{t.name} ({t.width}×{t.height})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-400">
                {template.width} × {template.height}px
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                placeholder="Big bold title"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                placeholder="Optional subtitle text"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setFile(null); setPreview(null); setNoBgPath(null); setResultPath(null); }}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                New Image
              </button>
              <button onClick={handleGenerate}
                className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600">
                Generate Thumbnail
              </button>
            </div>

            {resultPath && (
              <a href={resultPath} download="thumbnail.jpg"
                className="block w-full py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 text-center">
                Download Thumbnail
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
