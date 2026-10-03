import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { FiUsers, FiCalendar, FiBox, FiTrendingUp } from 'react-icons/fi';

// Register ChartJS modules
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return <Loader fullScreen />;
  }

  // Helper to generate random colors for charts
  const getColors = (length) => {
    const colors = [
      'rgba(14, 165, 233, 0.75)',  // sky-500
      'rgba(16, 185, 129, 0.75)',  // emerald-500
      'rgba(245, 158, 11, 0.75)',  // amber-500
      'rgba(239, 68, 68, 0.75)',   // red-500
      'rgba(139, 92, 246, 0.75)',  // violet-500
      'rgba(236, 72, 153, 0.75)',  // pink-500
    ];
    return Array.from({ length }, (_, i) => colors[i % colors.length]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 animate-fade-in">
          {/* Headline */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Analytics Dashboard</h2>
            <p className="text-sm text-slate-400">Monitor voter turnout and check live election statistics.</p>
          </div>

          {/* Metrics Grid */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Total Voters */}
              <div className="p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Voters</span>
                  <h3 className="text-2xl font-black">{stats.totalVoters}</h3>
                  <span className="text-[10px] text-green-500 font-semibold">{stats.approvedVotersCount} Approved</span>
                </div>
                <div className="p-3 bg-brand-500/10 text-brand-600 rounded-xl">
                  <FiUsers className="w-6 h-6" />
                </div>
              </div>

              {/* Total Candidates */}
              <div className="p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Candidates</span>
                  <h3 className="text-2xl font-black">{stats.totalCandidates}</h3>
                  <span className="text-[10px] text-slate-400">In all elections</span>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
                  <FiUsers className="w-6 h-6" />
                </div>
              </div>

              {/* Active Elections */}
              <div className="p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Polls</span>
                  <h3 className="text-2xl font-black">{stats.activeElections}</h3>
                  <span className="text-[10px] text-slate-400">Voting in progress</span>
                </div>
                <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
                  <FiCalendar className="w-6 h-6" />
                </div>
              </div>

              {/* Turnout Card */}
              <div className="p-6 rounded-2xl glass-card flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Voter Turnout</span>
                  <h3 className="text-2xl font-black">{stats.turnoutPercentage}%</h3>
                  <span className="text-[10px] text-slate-400">{stats.totalVotes} Votes Casted</span>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                  <FiTrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
              <span>Live Election Results</span>
            </h3>

            {(!stats || stats.liveStats.length === 0) ? (
              <div className="p-12 text-center glass-card rounded-2xl text-slate-400">
                No active elections with voting data found. Open an election to see live results.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {stats.liveStats.map((item, index) => {
                  const labels = item.candidatesData.map((c) => c.candidateName);
                  const dataValues = item.candidatesData.map((c) => c.voteCount);
                  const totalVotes = dataValues.reduce((a, b) => a + b, 0);

                  const barData = {
                    labels,
                    datasets: [
                      {
                        label: 'Votes Casted',
                        data: dataValues,
                        backgroundColor: getColors(labels.length),
                        borderRadius: 8,
                      },
                    ],
                  };

                  const chartOptions = {
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  };

                  return (
                    <div key={index} className="p-6 rounded-2xl glass-card space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3">
                        <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.electionTitle}</h4>
                        <span className="text-xs px-2 py-0.5 bg-brand-100/50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-lg font-semibold">
                          Total: {totalVotes}
                        </span>
                      </div>
                      
                      <div className="h-64 flex items-center justify-center">
                        {totalVotes === 0 ? (
                          <div className="text-slate-400 text-xs flex flex-col items-center space-y-2">
                            <FiBox className="w-10 h-10" />
                            <span>No votes casted yet in this election.</span>
                          </div>
                        ) : (
                          <Bar data={barData} options={chartOptions} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
