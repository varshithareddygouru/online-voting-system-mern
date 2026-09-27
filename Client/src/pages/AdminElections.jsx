import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { FiPlus, FiTrash2, FiEdit2, FiCheckSquare, FiAlertCircle, FiClock, FiCalendar } from 'react-icons/fi';

const AdminElections = () => {
  const { user } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [editId, setEditId] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      if (res.data.success) {
        setElections(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchElections();
    }
  }, [user]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.post('/elections', { title, description, startDate, endDate });
      if (res.data.success) {
        setSuccessMessage('Election created successfully!');
        setShowAddModal(false);
        resetForm();
        fetchElections();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error creating election');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.put(`/elections/${editId}`, { title, description, startDate, endDate, status });
      if (res.data.success) {
        setSuccessMessage('Election updated successfully!');
        setShowEditModal(false);
        resetForm();
        fetchElections();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error updating election');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting this election will permanently delete all associated candidates and votes. Proceed?')) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.delete(`/elections/${id}`);
      if (res.data.success) {
        setSuccessMessage('Election deleted successfully!');
        fetchElections();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error deleting election');
    }
  };

  const openEdit = (election) => {
    setEditId(election._id);
    setTitle(election.title);
    setDescription(election.description);
    // Format dates for input (YYYY-MM-DDThh:mm)
    const startStr = new Date(election.startDate).toISOString().slice(0, 16);
    const endStr = new Date(election.endDate).toISOString().slice(0, 16);
    setStartDate(startStr);
    setEndDate(endStr);
    setStatus(election.status);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setStatus('upcoming');
    setEditId('');
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
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Manage Elections</h2>
              <p className="text-sm text-slate-400">Create, publish, and delete voting events.</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md flex items-center space-x-1.5 transition-colors"
            >
              <FiPlus />
              <span>New Election</span>
            </button>
          </div>

          {/* Banner messages */}
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

          {/* Elections List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.length === 0 ? (
              <div className="md:col-span-3 p-12 text-center glass-card rounded-3xl text-slate-400">
                No elections created yet. Click "New Election" to begin.
              </div>
            ) : (
              elections.map((el) => (
                <div key={el._id} className="p-6 rounded-2xl glass-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-900/50">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      {el.status === 'active' && (
                        <span className="px-2.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Active / Voting Open
                        </span>
                      )}
                      {el.status === 'upcoming' && (
                        <span className="px-2.5 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Upcoming
                        </span>
                      )}
                      {el.status === 'completed' && (
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Completed / Closed
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{el.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{el.description}</p>
                    
                    <div className="space-y-1.5 pt-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span>Starts: {new Date(el.startDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>Ends: {new Date(el.endDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-900/50 mt-4 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">{el.candidates?.length || 0} Candidates</span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEdit(el)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
                        title="Edit Details"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(el._id)}
                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 transition-colors"
                        title="Delete Election"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-card shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold">Create New Election Event</h3>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Title</label>
                <input type="text" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Description</label>
                <textarea rows="3" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Start Date & Time</label>
                  <input type="datetime-local" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-none focus:ring-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">End Date & Time</label>
                  <input type="datetime-local" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-none focus:ring-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-card shadow-2xl space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold">Update Election Parameters</h3>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Title</label>
                <input type="text" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-none focus:ring-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Description</label>
                <textarea rows="3" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-none" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Start Date</label>
                  <input type="datetime-local" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase">End Date</label>
                  <input type="datetime-local" className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">Election Status</label>
                <select className="w-full px-4 py-2 bg-white/50 dark:bg-slate-950/50 border rounded-xl text-sm" value={status} onChange={(e) => setStatus(e.target.value)} required>
                  <option value="upcoming">Upcoming (Scheduled)</option>
                  <option value="active">Active (Voting Open)</option>
                  <option value="completed">Completed (Archived / Closed)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminElections;
