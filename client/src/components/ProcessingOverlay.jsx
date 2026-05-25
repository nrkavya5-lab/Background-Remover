export default function ProcessingOverlay({ status }) {
  const messages = [
    'Analyzing image...',
    'Removing background...',
    'Refining edges...',
    'Almost done...',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {status || 'Processing...'}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {messages[Math.min(Math.floor((Date.now() % 12000) / 3000), 3)]}
        </p>
      </div>
    </div>
  );
}
