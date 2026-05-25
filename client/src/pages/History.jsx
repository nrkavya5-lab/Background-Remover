import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatFileSize } from 'shared/utils/helpers';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'removeBg', label: 'BG Removed' },
  { value: 'replaceBg', label: 'Replaced' },
  { value: 'edit', label: 'Edited' },
  { value: 'batch', label: 'Batch' },
];

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (filter) params.filter = filter;
    api.get('/api/user/history', { params })
      .then(({ data }) => { setItems(data.items); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, [page, filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/api/user/history/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setTotal((t) => t - 1);
    } catch {}
    setDeleting(null);
  };

  const pages = Math.ceil(total / 20);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            History <span className="text-base font-normal text-gray-400">({total})</span>
          </h1>
          <button onClick={() => navigate('/')} className="px-5 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600">
            New Edit
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
            />
          </form>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No history yet</p>
            <p className="text-sm mt-1">Processed images will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                  <img
                    src={item.resultPath}
                    alt={item.originalName}
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = item.resultPath;
                        a.download = item.originalName?.replace(/\.[^.]+$/, '-result.png') || 'image.png';
                        a.click();
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{item.originalName}</p>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{item.operationType}</span>
                    <span>{item.fileSize ? formatFileSize(item.fileSize) : ''}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">{page} / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
