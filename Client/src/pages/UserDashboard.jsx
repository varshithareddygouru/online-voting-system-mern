import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiArrowRight, FiBookOpen } from 'react-icons/fi';

const UserDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [votedStatusMap, setVotedStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElectionsData = async () => {
      try {
        const res = await api.get('/elections');
        if (res.data.success) {
          const list = res.data.data;
          setElections(list);

          // For active elections, check if user has already voted
          const activeElections = list.filter((el) => el.status === 'active');
          const votedChecks = {};

          await Promise.all(
            activeElections.map(async (el) => {
              try {
                const checkRes = await api.get(`/votes/check/${el._id}`);
                votedChecks[el._id] = checkRes.data.hasVoted;
              } catch (err) {
                console.error(`Error checking voted status for ${el._id}`, err);
              }
            })
          );

          setVotedStatusMap(votedChecks);
        }
      } catch (error) {
        console.error('Error fetching elections:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchElectionsData();
    }
  }, [user]);

  if (authLoading || loading) {
    return <Loader fullScreen />;
  }

  // Group elections
  const activeElections = elections.filter((el) => el.status === 'active');
  const upcomingElections = elections.filter((el) => el.status === 'upcoming');
  const completedElections = elections.filter((el) => el.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* Welcome Card */}
          <div className="p-6 rounded-3xl glass-card flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <img
                src={user.profileImage ? `http://localhost:5000${user.profileImage}` : 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border border-brand-500 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=User';
                }}
              />
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Hello, {user.fullName}!</h2>
                <p className="text-xs text-slate-400">Voter ID: <span className="font-mono">{user.voterId}</span></p>
              </div>
            </div>

            {/* Approval Status Badge */}
            {user.isApproved ? (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl text-sm font-semibold">
                <FiCheckCircle />
                <span>Account Approved to Vote</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl text-sm font-semibold animate-pulse">
                <FiClock />
                <span>Voter Approval Pending</span>
              </div>
            )}
          </div>

          {/* Active Elections */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
              <span>Active Elections</span>
            </h3>

            {activeElections.length === 0 ? (
              <div className="p-8 text-center glass-card rounded-2xl text-slate-400">
                No active elections currently running.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {activeElections.map((election) => {
                  const hasVoted = votedStatusMap[election._id];
                  return (
                    <div key={election._id} className="p-6 rounded-2xl glass-card flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Live voting</span>
                          <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                            <FiClock />
                            <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">{election.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{election.description}</p>
                      </div>

                      <div className="pt-6 flex justify-between items-center border-t border-slate-100 dark:border-slate-900/50 mt-4">
                        <span className="text-xs text-slate-400">{election.candidates?.length || 0} Candidates Listed</span>
                        {hasVoted ? (
                          <div className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Ballot Submitted</span>
                          </div>
                        ) : user.isApproved ? (
                          <Link
                            to={`/vote/${election._id}`}
                            className="inline-flex items-center space-x-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                          >
                            <span>Cast Vote</span>
                            <FiArrowRight />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-xl text-xs font-bold cursor-not-allowed"
                            title="Approval Required"
                          >
                            <FiAlertTriangle />
                            <span>Awaiting Approval</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming & Completed Tab Group */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upcoming */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Upcoming Polls</h3>
              <div className="space-y-4">
                {upcomingElections.length === 0 ? (
                  <div className="p-6 text-center glass-card rounded-2xl text-slate-400 text-sm">
                    No scheduled upcoming elections.
                  </div>
                ) : (
                  upcomingElections.map((election) => (
                    <div key={election._id} className="p-5 rounded-2xl glass-card space-y-2 shadow-sm">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span className="font-semibold text-brand-600 dark:text-brand-400 uppercase">Upcoming</span>
                        <span>Starts: {new Date(election.startDate).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-md font-bold">{election.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{election.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Completed Elections</h3>
              <div className="space-y-4">
                {completedElections.length === 0 ? (
                  <div className="p-6 text-center glass-card rounded-2xl text-slate-400 text-sm">
                    No completed elections found.
                  </div>
                ) : (
                  completedElections.map((election) => (
                    <div key={election._id} className="p-5 rounded-2xl glass-card flex justify-between items-center shadow-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-bold uppercase">Archived</span>
                        <h4 className="text-md font-bold text-slate-800 dark:text-white">{election.title}</h4>
                      </div>
                      <Link
                        to={`/results/${election._id}`}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
                        title="View Results"
                      >
                        <FiBookOpen className="w-5 h-5" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
