const STATUS_ICONS = {
  pending: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
    </svg>
  ),
  processing: (
    <svg className="w-5 h-5 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
  done: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  failed: (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function BatchQueue({ files }) {
  return (
    <div className="max-h-80 overflow-y-auto space-y-1">
      {files.map((file, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors ${
            file.status === 'failed'
              ? 'bg-red-50 dark:bg-red-900/20'
              : file.status === 'done'
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-gray-50 dark:bg-gray-800'
          }`}
        >
          <div className="flex-shrink-0">{STATUS_ICONS[file.status] || STATUS_ICONS.pending}</div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-gray-900 dark:text-white">{file.name}</p>
            {file.error && <p className="text-xs text-red-500 truncate">{file.error}</p>}
          </div>
          <span className={`text-xs font-medium flex-shrink-0 ${
            file.status === 'done' ? 'text-green-600' :
            file.status === 'failed' ? 'text-red-600' :
            file.status === 'processing' ? 'text-primary-600' :
            'text-gray-400'
          }`}>
            {file.status === 'done' ? 'Done' :
             file.status === 'failed' ? 'Failed' :
             file.status === 'processing' ? 'Processing...' :
             'Pending'}
          </span>
        </div>
      ))}
    </div>
  );
}
