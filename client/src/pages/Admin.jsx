import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatFileSize } from 'shared/utils/helpers';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/daily-usage'),
      api.get('/api/admin/revenue'),
      api.get('/api/admin/users', { params: { page: userPage } }),
    ])
      .then(([s, d, r, u]) => {
        setStats(s.data);
        setDailyUsage(d.data.data || []);
        setRevenue(r.data.data || []);
        setUsers(u.data.users || []);
        setUserTotal(u.data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userPage]);

  const exportCSV = () => {
    const headers = 'Date,Images,Revenue\n';
    const rows = revenue.map((r) => `${r.date},${r.images},$${r.revenue}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const pieData = stats?.byType?.map((t) => ({ name: t._id, value: t.count })) || [];
  const userPages = Math.ceil(userTotal / 20);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Analytics</h1>
          <button onClick={exportCSV} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats?.totalUsers || 0} />
          <StatCard label="Total Images" value={stats?.totalImages || 0} />
          <StatCard label="Last 24h" value={stats?.recentImages || 0} />
          <StatCard label="Storage" value={formatFileSize(stats?.totalStorage || 0)} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Usage (30 days)</h2>
            {dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm">No data yet</p>}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Processing by Type</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm">No data yet</p>}
          </div>
        </div>

        {revenue.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue (Est.)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Images</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2.5 text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-2.5 text-gray-500">{u.email}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500">{u.imageCount}</td>
                    <td className="py-2.5 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40">Previous</button>
              <span className="px-3 py-1 text-sm text-gray-500">{userPage} / {userPages}</span>
              <button onClick={() => setUserPage((p) => Math.min(userPages, p + 1))} disabled={userPage === userPages}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
