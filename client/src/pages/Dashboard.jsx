import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from 'shared/utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, guestCount } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get('/api/user/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guest Mode</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You've processed {guestCount} image(s) as a guest.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const byType = {};
  if (stats?.byType) stats.byType.forEach((t) => { byType[t._id] = t.count; });

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, {user.name}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600"
          >
            New Edit
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Processed" value={stats?.totalProcessed || 0} icon="image" />
          <StatCard label="Storage Used" value={formatFileSize(stats?.storageUsed || 0)} icon="storage" />
          <StatCard label="BG Removed" value={byType.removeBg || 0} icon="cut" />
          <StatCard label="Replaced" value={byType.replaceBg || 0} icon="replace" />
        </div>

        {stats?.recentActivity?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {stats.recentActivity.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <img
                    src={item.resultPath}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.originalName}</p>
                    <p className="text-xs text-gray-500">{item.operationType} — {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/history')}
              className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              View all history →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
