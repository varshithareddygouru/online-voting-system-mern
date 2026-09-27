import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const VotingHistory = () => {
  const { user } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [participationMap, setParticipationMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/elections');
        if (res.data.success) {
          const list = res.data.data;
          setElections(list);

          const participations = {};
          await Promise.all(
            list.map(async (el) => {
              try {
                const checkRes = await api.get(`/votes/check/${el._id}`);
                participations[el._id] = checkRes.data.hasVoted;
              } catch (err) {
                console.error(err);
              }
            })
          );
          setParticipationMap(participations);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Voting History</h2>
            <p className="text-sm text-slate-400">Track your ballot participation across all active and completed elections.</p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 dark:bg-slate-900/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4">Election Name</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Your Participation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50 text-sm">
                  {elections.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                        No election history records found.
                      </td>
                    </tr>
                  ) : (
                    elections.map((el) => {
                      const hasVoted = participationMap[el._id];
                      return (
                        <tr key={el._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {el.title}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(el.startDate).toLocaleDateString()} - {new Date(el.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {el.status === 'active' && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase">
                                Active
                              </span>
                            )}
                            {el.status === 'upcoming' && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-xs font-bold uppercase">
                                Upcoming
                              </span>
                            )}
                            {el.status === 'completed' && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold uppercase">
                                Completed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {hasVoted ? (
                              <span className="inline-flex items-center space-x-1.5 text-green-600 dark:text-green-400 font-semibold">
                                <FiCheckCircle />
                                <span>Ballot Casted</span>
                              </span>
                            ) : el.status === 'completed' ? (
                              <span className="inline-flex items-center space-x-1.5 text-slate-400 font-medium">
                                <FiXCircle />
                                <span>Missed / Not Casted</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1.5 text-amber-500 font-medium">
                                <FiClock />
                                <span>Not Casted Yet</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
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

export default VotingHistory;
