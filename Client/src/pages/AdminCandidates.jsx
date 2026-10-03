import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { FiPlus, FiTrash2, FiEdit2, FiCamera } from 'react-icons/fi';

const AdminCandidates = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [party, setParty] = useState('');
  const [biography, setBiography] = useState('');
  const [electionId, setElectionId] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editId, setEditId] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchInitialData = async () => {
    try {
      const electionsRes = await api.get('/elections');

      if (electionsRes.data.success) {
        setElections(electionsRes.data.data);

        // Compile candidates across all elections
        const allCandidates = [];

        electionsRes.data.data.forEach((el) => {
          if (el.candidates) {
            el.candidates.forEach((cand) => {
              allCandidates.push({
                ...cand,
                electionTitle: el.title,
              });
            });
          }
        });

        setCandidates(allCandidates);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load candidates data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // ADD CANDIDATE
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!electionId) {
      setErrorMessage('Please select an associated election');
      return;
    }

    const formData = new FormData();

    formData.append('name', name);
    formData.append('age', age);
    formData.append('party', party);
    formData.append('biography', biography);

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const res = await api.post(
        `/elections/${electionId}/candidates`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data.success) {
        setSuccessMessage('Candidate registered successfully!');

        setShowAddModal(false);

        resetForm();

        fetchInitialData();
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Error adding candidate'
      );
    }
  };

  // EDIT CANDIDATE
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();

    formData.append('name', name);
    formData.append('age', age);
    formData.append('party', party);
    formData.append('biography', biography);

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const res = await api.put(
        `/elections/candidates/${editId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data.success) {
        setSuccessMessage(
          'Candidate details updated successfully!'
        );

        setShowEditModal(false);

        resetForm();

        fetchInitialData();
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Error updating candidate'
      );
    }
  };

  // DELETE CANDIDATE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate profile permanently?')) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.delete(
        `/elections/candidates/${id}`
      );

      if (res.data.success) {
        setSuccessMessage('Candidate removed successfully');

        fetchInitialData();
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Error deleting candidate'
      );
    }
  };

  // OPEN EDIT MODAL
  const openEdit = (cand) => {
    setEditId(cand._id);

    setName(cand.name || '');

    setAge(cand.age || '');

    setParty(cand.party || '');

    setBiography(cand.biography || '');

    setPhotoPreview(
      cand.photo
        ? `http://localhost:5000${cand.photo}`
        : null
    );

    setPhotoFile(null);

    setShowEditModal(true);
  };

  // RESET FORM
  const resetForm = () => {
    setName('');
    setAge('');
    setParty('');
    setBiography('');
    setElectionId('');
    setPhotoFile(null);
    setPhotoPreview(null);
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

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Manage Candidates
              </h2>

              <p className="text-sm text-slate-400">
                Add and edit candidate details.
              </p>

            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md flex items-center space-x-1.5 transition-colors"
            >
              <FiPlus />
              <span>Add Candidate</span>
            </button>

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

          {/* Candidates Grid */}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {candidates.length === 0 ? (

              <div className="md:col-span-3 p-12 text-center glass-card rounded-3xl text-slate-400">
                No candidates registered yet. Click "Add Candidate" to get started.
              </div>

            ) : (

              candidates.map((cand) => (

                <div
                  key={cand._id}
                  className="p-6 rounded-2xl glass-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-slate-200/50 dark:border-slate-900/50"
                >

                  <div className="space-y-4">

                    <div className="flex items-center space-x-4">

                      <img
                        src={
                          cand.photo
                            ? `http://localhost:5000${cand.photo}`
                            : 'https://api.dicebear.com/7.x/initials/svg?seed=Candidate'
                        }
                        alt={cand.name}
                        className="w-14 h-14 rounded-full object-cover border"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://api.dicebear.com/7.x/initials/svg?seed=Candidate';
                        }}
                      />

                      <div>

                        <h4 className="font-bold text-slate-900 dark:text-white leading-snug">
                          {cand.name}
                        </h4>

                        {cand.age && (
                          <p className="text-xs text-slate-500">
                            Age: {cand.age}
                          </p>
                        )}

                        <span className="text-[10px] px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full font-bold uppercase tracking-wide">
                          {cand.party}
                        </span>

                      </div>

                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {cand.biography}
                    </p>

                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Election:{' '}
                      <span className="text-slate-600 dark:text-slate-300">
                        {cand.electionTitle}
                      </span>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-900/50 mt-4 flex justify-end space-x-2">

                    <button
                      onClick={() => openEdit(cand)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
                      title="Edit Profile"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(cand._id)}
                      className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 transition-colors"
                      title="Delete Candidate"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </main>

      </div>

      {/* ADD CANDIDATE MODAL */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">

          <div className="w-full max-w-lg p-6 rounded-3xl glass-card shadow-2xl space-y-4 animate-slide-up">

            <h3 className="text-lg font-bold">
              Add Candidate Profile
            </h3>

            <form
              className="space-y-4"
              onSubmit={handleAddSubmit}
            >

              {/* Photo */}

              <div className="flex flex-col items-center justify-center space-y-2">

                <div className="relative">

                  <img
                    src={
                      photoPreview ||
                      '/uploads/default-candidate.png'
                    }
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border"
                  />

                  <label
                    htmlFor="addPhoto"
                    className="absolute bottom-0 right-0 p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer shadow-md"
                  >
                    <FiCamera className="w-3.5 h-3.5" />
                  </label>

                  <input
                    id="addPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                </div>

              </div>

              {/* NAME, AGE AND PARTY */}

              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-1">

                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Name
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                </div>

                <div className="space-y-1">

                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Age
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />

                </div>

                <div className="space-y-1">

                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Party Name
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none"
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    required
                  />

                </div>

              </div>

              {/* ASSOCIATED ELECTION */}

              <div className="space-y-1">

                <label className="block text-xs font-bold text-slate-400 uppercase">
                  Associated Election
                </label>

                <select
                  className="w-full px-4 py-2 border rounded-xl text-sm"
                  value={electionId}
                  onChange={(e) =>
                    setElectionId(e.target.value)
                  }
                  required
                >

                  <option value="">
                    Select Election
                  </option>

                  {elections.map((el) => (

                    <option
                      key={el._id}
                      value={el._id}
                    >
                      {el.title} ({el.status})
                    </option>

                  ))}

                </select>

              </div>

              {/* BIOGRAPHY */}

              <div className="space-y-1">

                <label className="block text-xs font-bold text-slate-400 uppercase">
                  Biography / Manifesto
                </label>

                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none"
                  value={biography}
                  onChange={(e) =>
                    setBiography(e.target.value)
                  }
                  required
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-4 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs"
                >
                  Register Candidate
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* EDIT CANDIDATE MODAL */}

      {showEditModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">

          <div className="w-full max-w-lg p-6 rounded-3xl glass-card shadow-2xl space-y-4 animate-slide-up">

            <h3 className="text-lg font-bold">
              Edit Candidate Profile
            </h3>

            <form
              className="space-y-4"
              onSubmit={handleEditSubmit}
            >

              {/* PHOTO */}

              <div className="flex flex-col items-center justify-center space-y-2">

                <div className="relative">

                  <img
                    src={
                      photoPreview ||
                      '/uploads/default-candidate.png'
                    }
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border"
                  />

                  <label
                    htmlFor="editPhoto"
                    className="absolute bottom-0 right-0 p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer"
                  >
                    <FiCamera className="w-3.5 h-3.5" />
                  </label>

                  <input
                    id="editPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                </div>

              </div>

              {/* NAME, AGE AND PARTY */}

              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-1">

                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Name
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />

                </div>

                <div className="space-y-1">

                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Age
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm"
                    value={age}
                    onChange={(e) =>
                      setAge(e.target.value)
                    }
                    required
                  />

                </div>

                <div className="space-y-1">

                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Party Name
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-xl text-sm"
                    value={party}
                    onChange={(e) =>
                      setParty(e.target.value)
                    }
                    required
                  />

                </div>

              </div>

              {/* BIOGRAPHY */}

              <div className="space-y-1">

                <label className="block text-xs font-bold text-slate-400 uppercase">
                  Biography / Manifesto
                </label>

                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border rounded-xl text-sm"
                  value={biography}
                  onChange={(e) =>
                    setBiography(e.target.value)
                  }
                  required
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-4 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminCandidates;