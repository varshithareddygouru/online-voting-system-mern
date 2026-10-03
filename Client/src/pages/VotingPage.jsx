import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { FiCheckSquare, FiUser, FiInfo, FiChevronLeft, FiCheck } from 'react-icons/fi';

const VotingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [votingSuccess, setVotingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkEligibilityAndLoad = async () => {
      try {
        // 1. Check if user already voted
        const checkRes = await api.get(`/votes/check/${id}`);
        if (checkRes.data.hasVoted) {
          navigate('/dashboard');
          return;
        }

        // 2. Load election details
        const res = await api.get(`/elections/${id}`);
        if (res.data.success) {
          setElection(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load election details');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      if (!user.isApproved) {
        navigate('/dashboard');
      } else {
        checkEligibilityAndLoad();
      }
    }
  }, [id, user, navigate]);

  const handleCastVote = async () => {
    setLoading(true);
    setErrorMessage('');
    setShowConfirmModal(false);

    try {
      const res = await api.post('/votes', {
        electionId: id,
        candidateId: selectedCandidate._id,
      });

      if (res.data.success) {
        setVotingSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (votingSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-3xl glass-card shadow-2xl flex flex-col items-center justify-center text-center space-y-6 animate-slide-up">
          {/* Animated checkmark circle */}
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl shadow-xl shadow-green-500/20 animate-bounce">
            <FiCheck />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Vote Submitted!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your vote has been cryptographically signed and anonymous. The ballot is locked in the database forever.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Redirecting you back to your portal dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* Header Link */}
          <Link to="/dashboard" className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors">
            <FiChevronLeft />
            <span>Back to Dashboard</span>
          </Link>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/30 text-red-600 dark:text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {election && (
            <div className="space-y-6">
              {/* Info Header */}
              <div className="p-6 rounded-3xl glass-card shadow-sm space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Ballot Selection</span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{election.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{election.description}</p>
                
                <div className="flex items-start space-x-2 text-xs bg-brand-500/5 dark:bg-brand-400/5 text-brand-700 dark:text-brand-400 p-3 rounded-xl border border-brand-500/10 mt-2">
                  <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Choose one candidate from the list below. To confirm and secure your ballot, complete the confirmation popup.</span>
                </div>
              </div>

              {/* Candidates List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {election.candidates?.map((candidate) => (
                  <div
                    key={candidate._id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm border ${
                      selectedCandidate?._id === candidate._id
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-950/20 shadow-md ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800 glass-card hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={candidate.photo ? `http://localhost:5000${candidate.photo}` : 'https://api.dicebear.com/7.x/initials/svg?seed=Candidate'}
                        alt={candidate.name}
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=Candidate';
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{candidate.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-full font-semibold text-slate-500 dark:text-slate-400">
                          {candidate.party}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {candidate.biography}
                    </p>

                    <div className="pt-2 flex justify-end">
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        selectedCandidate?._id === candidate._id
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                      }`}>
                        {selectedCandidate?._id === candidate._id ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action bar */}
              <div className="flex justify-end pt-4">
                <button
                  disabled={!selectedCandidate}
                  onClick={() => setShowConfirmModal(true)}
                  className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 rounded-xl font-semibold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all text-sm flex items-center space-x-2"
                >
                  <FiCheckSquare className="w-5 h-5" />
                  <span>Submit Selection</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl glass-card shadow-2xl space-y-6 animate-slide-up">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Verify Ballot Choice</h3>
              <p className="text-xs text-slate-400">Please review your selected candidate details below</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center space-x-4 border border-slate-100 dark:border-slate-900/40">
              <img
                src={selectedCandidate.photo ? `http://localhost:5000${selectedCandidate.photo}` : 'https://api.dicebear.com/7.x/initials/svg?seed=Candidate'}
                alt={selectedCandidate.name}
                className="w-14 h-14 rounded-full object-cover border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=Candidate';
                }}
              />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{selectedCandidate.name}</h4>
                <p className="text-xs text-slate-400 font-semibold">{selectedCandidate.party}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
              <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> You are voting in "{election.title}". Your ballot choice is final. You cannot modify, change, or delete it once submitted.
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCastVote}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-brand-500/10 transition-colors"
              >
                Confirm & Cast Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
