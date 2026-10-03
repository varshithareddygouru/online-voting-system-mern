import React, { useContext, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import VotingPage from './pages/VotingPage';
import VotingHistory from './pages/VotingHistory';
import UserProfile from './pages/UserProfile';
import ElectionResults from './pages/ElectionResults';

import AdminDashboard from './pages/AdminDashboard';
import AdminElections from './pages/AdminElections';
import AdminCandidates from './pages/AdminCandidates';
import AdminVoters from './pages/AdminVoters';
import AuditLogs from './pages/AuditLogs';
import Loader from './components/Loader';

// Error Boundary Component to display exact runtime errors on page
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-3xl border border-red-200 dark:border-red-900/30 space-y-4 max-w-2xl mx-auto mt-20 font-sans shadow-xl">
          <h2 className="text-xl font-bold">Application Crash Detected</h2>
          <p className="text-sm font-semibold">{this.state.error && this.state.error.toString()}</p>
          <div className="text-xs text-slate-500">Component Stack Trace:</div>
          <pre className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl overflow-x-auto text-[10px] border border-red-100 dark:border-red-950 font-mono leading-relaxed max-h-96">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <p className="text-xs text-slate-400">Please review the error stack details above.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route for Voters
const ProtectedRoute = ({ children }) => {
  const { token, role, loading } = useContext(AuthContext);
  
  if (loading) {
    return <Loader fullScreen />;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin tries to access voter route, redirect to admin panel
  if (role === 'admin' || role === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// Protected Route for Admins
const AdminRoute = ({ children }) => {
  const { token, role, loading } = useContext(AuthContext);
  
  if (loading) {
    return <Loader fullScreen />;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If normal voter tries to access admin route, redirect to voter portal
  if (role !== 'admin' && role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Route wrapper accessible to both authenticated voters and admins
const SharedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) {
    return <Loader fullScreen />;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Voter Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/vote/:id" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />
              <Route path="/dashboard/history" element={<ProtectedRoute><VotingHistory /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

              {/* Admin Protected Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/elections" element={<AdminRoute><AdminElections /></AdminRoute>} />
              <Route path="/admin/candidates" element={<AdminRoute><AdminCandidates /></AdminRoute>} />
              <Route path="/admin/voters" element={<AdminRoute><AdminVoters /></AdminRoute>} />
              <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />

              {/* Shared Authenticated Routes */}
              <Route path="/results/:id" element={<SharedRoute><ElectionResults /></SharedRoute>} />

              {/* Redirect fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
