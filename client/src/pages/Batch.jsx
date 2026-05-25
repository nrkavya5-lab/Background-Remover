import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import BatchQueue from '../components/batch/BatchQueue';
import BatchProgressBar from '../components/batch/BatchProgressBar';

export default function Batch() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [batchId, setBatchId] = useState(null);
  const [phase, setPhase] = useState('select');
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const pollingRef = useRef(null);

  const [allFiles, setAllFiles] = useState([]);

  const onDrop = useCallback((accepted) => {
    const newFiles = accepted.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      preview: URL.createObjectURL(f),
      status: 'pending',
      error: null,
    }));
    setAllFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (idx) => {
    setAllFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (allFiles.length === 0) return;
    setPhase('uploading');
    const form = new FormData();
    allFiles.forEach((f) => form.append('images', f.file));

    try {
      const { data } = await api.post('/api/batch/upload', form);
      setBatchId(data.batchId);
      setFiles(data.files.map((f) => ({ ...f, status: 'pending' })));
      setPhase('processing');
      startProcessing(data.batchId);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || 'Unknown error'));
      setPhase('select');
    }
  };

  const startProcessing = async (id) => {
    setProcessing(true);
    try {
      await api.post('/api/batch/process', { batchId: id });
      pollingRef.current = setInterval(() => pollStatus(id), 1000);
    } catch {
      setProcessing(false);
    }
  };

  const pollStatus = async (id) => {
    try {
      const { data } = await api.get(`/api/batch/status/${id}`);
      setFiles(data.files);
      if (data.completeTime) {
        clearInterval(pollingRef.current);
        setProcessing(false);
        setPhase('complete');
      }
    } catch {
      clearInterval(pollingRef.current);
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/api/batch/download/${batchId}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${batchId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed');
    }
    setDownloading(false);
  };

  const total = files.length;
  const completed = files.filter((f) => f.status === 'done').length;
  const failed = files.filter((f) => f.status === 'failed').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Batch Processing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Upload multiple images and remove backgrounds at once.</p>
        </div>

        {phase === 'select' && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to select'}
              </p>
              <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP — Max 20MB each — Up to 20 files</p>
            </div>

            {allFiles.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium text-gray-900 dark:text-white">{allFiles.length} file(s) selected</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {allFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <img src={f.preview} alt="" className="w-10 h-10 rounded object-cover" />
                      <span className="flex-1 text-sm truncate">{f.name}</span>
                      <button onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAllFiles([])}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600"
                  >
                    Upload & Process All
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase !== 'select' && (
          <div className="space-y-4">
            <BatchProgressBar total={total} completed={completed} failed={failed} />
            <BatchQueue files={files} />

            {phase === 'complete' && (
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadZip}
                  disabled={downloading || completed === 0}
                  className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {downloading ? 'Downloading...' : 'Download All (ZIP)'}
                </button>
                <button
                  onClick={() => { setPhase('select'); setAllFiles([]); setFiles([]); setBatchId(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  New Batch
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
