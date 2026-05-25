import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DownloadButton from '../components/DownloadButton';
import ProcessingOverlay from '../components/ProcessingOverlay';
import BackgroundPicker from '../components/BackgroundPicker';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import BeforeAfterToggle from '../components/BeforeAfterToggle';
import ImageEditor from '../components/ImageEditor';

export default function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  const image = location.state?.image;

  const [processing, setProcessing] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [noBgResult, setNoBgResult] = useState(null);
  const [replacedResult, setReplacedResult] = useState(null);
  const [compareMode, setCompareMode] = useState('slider');
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!image) navigate('/', { replace: true });
  }, [image, navigate]);

  const processImage = async () => {
    setProcessing(true);
    setError(null);
    setStatus('Removing background...');
    try {
      const { data } = await api.post('/api/remove-bg', { imagePath: image.path });
      setNoBgResult(data);
      setReplacedResult(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Processing failed');
    }
    setProcessing(false);
  };

  useEffect(() => {
    if (image) processImage();
  }, [image]);

  const handleApplyBackground = async (bg) => {
    if (!noBgResult) return;
    setReplacing(true);
    setError(null);
    setStatus('Applying background...');
    try {
      let data;
      if (bg.type === 'color') {
        const res = await api.post('/api/replace-bg', {
          imagePath: noBgResult.path,
          color: bg.value,
        });
        data = res.data;
      } else if (bg.type === 'gradient') {
        const res = await api.post('/api/replace-bg/gradient', {
          imagePath: noBgResult.path,
          startColor: bg.startColor,
          endColor: bg.endColor,
        });
        data = res.data;
      } else if (bg.type === 'image' && bg.file) {
        const form = new FormData();
        form.append('imagePath', noBgResult.path);
        form.append('backgroundImage', bg.file);
        const res = await api.post('/api/replace-bg/image', form);
        data = res.data;
      }
      if (data) setReplacedResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Background replacement failed');
    }
    setReplacing(false);
  };

  const handleResetTransparent = () => {
    setReplacedResult(null);
  };

  const finalResult = replacedResult || noBgResult;

  if (!image) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      {(processing || replacing) && <ProcessingOverlay status={status} />}

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {finalResult ? 'Your Result' : 'Processing...'}
          </h2>
        </div>

        {error && (
          <div className="text-center space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
            <button
              onClick={processImage}
              className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        )}

        {finalResult && (
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <button
                  onClick={() => setCompareMode('slider')}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    compareMode === 'slider'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Slider
                </button>
                <button
                  onClick={() => setCompareMode('toggle')}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    compareMode === 'toggle'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Toggle
                </button>
              </div>

              {compareMode === 'slider' ? (
                <BeforeAfterSlider
                  beforeSrc={image.path}
                  afterSrc={finalResult.path}
                  beforeLabel="Original"
                  afterLabel={replacedResult ? 'Replaced' : 'Background Removed'}
                />
              ) : (
                <BeforeAfterToggle
                  beforeSrc={image.path}
                  afterSrc={finalResult.path}
                  beforeLabel="Original"
                  afterLabel={replacedResult ? 'Replaced' : 'Background Removed'}
                />
              )}

              <div className="flex gap-3 justify-center flex-wrap">
                <DownloadButton
                  imagePath={finalResult.path}
                  filename={image.name?.replace(/\.[^.]+$/, replacedResult ? '-replaced.png' : '-no-bg.png')}
                />
                <button
                  onClick={() => { setShowEditor(true); setCompareMode('toggle'); }}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Edit Image
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  New Image
                </button>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              {showEditor ? (
                <ImageEditor
                  imagePath={finalResult.path}
                  onComplete={(edited) => { setReplacedResult(edited); setShowEditor(false); }}
                  onClose={() => setShowEditor(false)}
                />
              ) : (
                <BackgroundPicker
                  onApply={handleApplyBackground}
                  onResetTransparent={handleResetTransparent}
                  disabled={replacing}
                />
              )}
              <button
                onClick={() => setShowEditor(!showEditor)}
                className="w-full text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                {showEditor ? 'Switch to Background Picker' : 'Open Image Editor'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
