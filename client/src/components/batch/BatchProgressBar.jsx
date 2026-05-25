export default function BatchProgressBar({ total, completed, failed }) {
  const done = completed + failed;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>{done} / {total} files</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
        {completed > 0 && (
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        )}
        {failed > 0 && (
          <div
            className="bg-red-500 h-full transition-all duration-300"
            style={{ width: `${(failed / total) * 100}%` }}
          />
        )}
      </div>
      <div className="flex gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> {completed} succeeded
        </span>
        {failed > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> {failed} failed
          </span>
        )}
      </div>
    </div>
  );
}
