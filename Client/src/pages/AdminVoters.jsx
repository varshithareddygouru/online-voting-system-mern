import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { FiCheck, FiLock, FiUnlock, FiTrash2, FiClock, FiAlertCircle } from 'react-icons/fi';

const AdminVoters = () => {
  const { user } = useContext(AuthContext);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchVoters = async () => {
    try {
      const res = await api.get('/admin/voters');
      if (res.data.success) {
        setVoters(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load voters list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVoters();
    }
  }, [user]);

  const handleApprove = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.put(`/admin/voters/${id}/approve`);
      if (res.data.success) {
        setSuccessMessage('Voter registration approved!');
        fetchVoters();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleToggleLock = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.put(`/admin/voters/${id}/lock`);
      if (res.data.success) {
        setSuccessMessage(res.data.message);
        fetchVoters();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Lock operation failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this voter profile permanently?')) return;
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.delete(`/admin/voters/${id}`);
      if (res.data.success) {
        setSuccessMessage('Voter profile removed successfully');
        fetchVoters();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Delete operation failed');
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Voter Approvals & Registry</h2>
            <p className="text-sm text-slate-400">Approve new registrations, check credentials, or suspend voter profiles.</p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 text-green-600 dark:text-green-400 text-sm">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 dark:text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Table Container */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-900/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 dark:bg-slate-900/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4">Voter Profile</th>
                    <th className="px-6 py-4">Voter ID Card</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Verification Status</th>
                    <th className="px-6 py-4">Access Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-905 text-sm">
                  {voters.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        No registered voters found in records.
                      </td>
                    </tr>
                  ) : (
                    voters.map((v) => (
                      <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={v.profileImage ? `http://localhost:5000${v.profileImage}` : 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                              alt={v.fullName}
                              className="w-10 h-10 rounded-full object-cover border"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=User';
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-snug">{v.fullName}</p>
                              <span className="text-[10px] text-slate-400">Registered: {new Date(v.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {v.voterId}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          <p className="font-medium text-slate-700 dark:text-slate-300">{v.email}</p>
                          <p>{v.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          {v.isLocked ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-red-500/10 text-red-600 rounded-full text-xs font-bold uppercase">
                              <FiAlertCircle className="w-3.5 h-3.5" />
                              <span>Suspended</span>
                            </span>
                          ) : v.isApproved ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase">
                              <FiCheck className="w-3.5 h-3.5" />
                              <span>Approved</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold uppercase">
                              <FiClock className="w-3.5 h-3.5" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {/* Approve button */}
                            {!v.isApproved && !v.isLocked && (
                              <button
                                onClick={() => handleApprove(v._id)}
                                className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors"
                                title="Approve Voter Registration"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Lock Toggle */}
                            <button
                              onClick={() => handleToggleLock(v._id)}
                              className={`p-2 rounded-xl transition-colors ${
                                v.isLocked
                                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-amber-500'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                              }`}
                              title={v.isLocked ? 'Unlock Profile' : 'Suspend Profile'}
                            >
                              {v.isLocked ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleReject(v._id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                              title="Delete/Reject Registration"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
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

export default AdminVoters;
