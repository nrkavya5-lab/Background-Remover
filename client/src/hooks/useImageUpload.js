import { useState, useCallback } from 'react';
import api from '../services/api';

export default function useImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const validate = useCallback((f) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) {
      setError('Invalid file type. Allowed: JPG, PNG, WEBP');
      return false;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File too large. Max 20MB');
      return false;
    }
    return true;
  }, []);

  const selectFile = useCallback((f) => {
    setError(null);
    if (!validate(f)) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, [validate]);

  const upload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    const form = new FormData();
    form.append('image', file);

    try {
      const { data } = await api.post('/api/upload', form, {
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setUploading(false);
      setProgress(100);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setUploading(false);
      return null;
    }
  }, [file]);

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setProgress(0);
    setError(null);
  }, [preview]);

  return { file, preview, uploading, progress, error, selectFile, upload, reset };
}
