import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { FiActivity, FiSearch } from 'react-icons/fi';

const AuditLogs = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLogs();
    }
  }, [user]);

  const filteredLogs = logs.filter((log) => {
    const query = searchTerm.toLowerCase();
    return (
      log.username?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.userType?.toLowerCase().includes(query) ||
      log.ipAddress?.includes(query)
    );
  });

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Security Audit Trail</h2>
              <p className="text-sm text-slate-400 font-medium">Review administrative, voter registration, and voting activity logs.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FiSearch />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-4 py-2 border rounded-xl bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Table container */}
          <div className="glass-card rounded-3xl overflow-hidden border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 dark:bg-slate-900/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Action Event</th>
                    <th className="px-6 py-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-905 text-xs text-slate-500 dark:text-slate-400">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-450">
                        No matching activity logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {log.username}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.userType === 'Admin' 
                              ? 'bg-red-500/10 text-red-600' 
                              : log.userType === 'User'
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {log.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-300">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {log.ipAddress || 'Unknown'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuditLogs;
