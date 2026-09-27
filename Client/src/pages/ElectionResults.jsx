import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { FiChevronLeft, FiBox, FiCheckCircle } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ElectionResults = () => {
  const { id } = useParams();
  const { user, role } = useContext(AuthContext);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/votes/results/${id}`);
        if (res.data.success) {
          setResultsData(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load election results data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResults();
    }
  }, [id, user]);

  if (loading) {
    return <Loader fullScreen />;
  }

  // Generate chart configurations
  const getChartData = () => {
    if (!resultsData || resultsData.results.length === 0) return null;

    const labels = resultsData.results.map((r) => r.name);
    const dataValues = resultsData.results.map((r) => r.votes);
    
    const colors = [
      'rgba(14, 165, 233, 0.75)',  // Sky Blue
      'rgba(16, 185, 129, 0.75)',  // Emerald Green
      'rgba(245, 158, 11, 0.75)',  // Amber Orange
      'rgba(239, 68, 68, 0.75)',   // Red
      'rgba(139, 92, 246, 0.75)',  // Purple
    ];

    const backgroundColors = Array.from({ length: labels.length }, (_, i) => colors[i % colors.length]);

    return {
      labels,
      datasets: [
        {
          label: 'Votes Casted',
          data: dataValues,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = getChartData();
  const backPath = role === 'admin' || role === 'superadmin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* Back button */}
          <Link to={backPath} className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors">
            <FiChevronLeft />
            <span>Back to Portal</span>
          </Link>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-650 text-sm">
              {errorMessage}
            </div>
          )}

          {resultsData && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Header */}
              <div className="p-6 rounded-3xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Results Bulletin</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{resultsData.electionTitle}</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Status: <span className="uppercase text-brand-600 dark:text-brand-400">{resultsData.status}</span>
                  </p>
                </div>
                <div className="px-4 py-2 bg-brand-500/10 text-brand-600 rounded-2xl text-center">
                  <span className="block text-[10px] uppercase font-bold text-brand-700/60 dark:text-brand-400/60">Total Ballots Cast</span>
                  <span className="text-xl font-black">{resultsData.totalVotes}</span>
                </div>
              </div>

              {resultsData.totalVotes === 0 ? (
                <div className="p-12 text-center glass-card rounded-3xl text-slate-400 flex flex-col items-center justify-center space-y-4 shadow-sm">
                  <FiBox className="w-12 h-12" />
                  <p>No votes have been recorded for this election yet.</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6 items-start">
                  {/* Results breakdown list */}
                  <div className="p-6 rounded-3xl glass-card shadow-sm space-y-4">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">Candidates Share</h3>
                    
                    <div className="space-y-3">
                      {resultsData.results.map((resItem) => {
                        const pct = resultsData.totalVotes > 0 
                          ? ((resItem.votes / resultsData.totalVotes) * 100).toFixed(1)
                          : 0;

                        return (
                          <div key={resItem._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-2 border border-slate-100 dark:border-slate-900/40">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800 dark:text-white">{resItem.name}</span>
                              <span className="font-mono text-slate-400 font-bold">{resItem.votes} votes ({pct}%)</span>
                            </div>
                            
                            {/* Simple progress bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-brand-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chart view */}
                  <div className="lg:col-span-2 p-6 rounded-3xl glass-card shadow-sm flex flex-col items-center justify-center space-y-4">
                    <h3 className="text-md font-bold self-start text-slate-900 dark:text-white">Ballot Share Chart</h3>
                    
                    <div className="w-full max-w-sm h-64 md:h-72 flex items-center justify-center">
                      {chartData && <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ElectionResults;
