import { useNavigate } from 'react-router-dom';
import UploadBox from '../components/UploadBox';
import ImagePreview from '../components/ImagePreview';
import useImageUpload from '../hooks/useImageUpload';

export default function Home() {
  const navigate = useNavigate();
  const { file, preview, uploading, progress, error, selectFile, upload, reset } = useImageUpload();

  const handleUpload = async () => {
    const result = await upload();
    if (result) navigate('/editor', { state: { image: result } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Remove Background<br />
            <span className="text-primary-500">Instantly</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Upload an image and remove its background with AI — free and fast.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/batch')}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium underline underline-offset-2"
            >
              Batch Process Multiple Images
            </button>
          </div>
        </div>

        {!preview ? (
          <UploadBox onFileSelect={selectFile} />
        ) : (
          <div className="space-y-4">
            <ImagePreview src={preview} alt={file?.name} onReset={reset} />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {uploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                disabled={uploading}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Choose Another
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? `Uploading ${progress}%` : 'Remove Background'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
