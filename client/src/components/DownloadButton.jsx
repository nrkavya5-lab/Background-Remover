import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import QualitySelector from './QualitySelector';
import { formatFileSize } from 'shared/utils/helpers';

export default function DownloadButton({ imagePath, filename }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState('png');
  const [estimatedSize, setEstimatedSize] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.post('/api/download/compress', { imagePath, format, quality });
      const { path } = res.data;

      const blobRes = await api.get('/api/download', {
        params: { path },
        responseType: 'blob',
      });

      const ext = format === 'jpeg' ? 'jpg' : format;
      const url = URL.createObjectURL(blobRes.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = (filename || 'image').replace(/\.[^.]+$/, `.${ext}`);
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      const ext = format === 'jpeg' ? 'jpg' : format;
      const a = document.createElement('a');
      a.href = imagePath;
      a.download = (filename || 'image').replace(/\.[^.]+$/, `.${ext}`);
      a.click();
    }
    setDownloading(false);
  };

  const handleChange = ({ quality: q, format: f }) => {
    setQuality(q);
    setFormat(f);
  };

  const handleToggle = () => {
    setOpen(!open);
    if (!open) {
      api.post('/api/download/compress', { imagePath, format, quality })
        .then((res) => setEstimatedSize(res.data.size))
        .catch(() => {});
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleToggle}
        className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <QualitySelector quality={quality} format={format} onChange={handleChange} />

          {estimatedSize && (
            <p className="mt-3 text-xs text-center text-gray-400 dark:text-gray-500">
              Estimated size: {formatFileSize(estimatedSize)}
            </p>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-3 w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      )}
    </div>
  );
}
