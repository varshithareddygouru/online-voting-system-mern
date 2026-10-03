import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser, FiSliders } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login, adminLogin, role, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      if (role === 'admin' || role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [token, role, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMessage('');
      const action = isAdminLogin ? adminLogin : login;
      const res = await action(values.email, values.password);
      
      if (res.success) {
        if (isAdminLogin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(res.message);
      }
      setSubmitting(false);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-3xl glass-card shadow-2xl space-y-6 animate-slide-up">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">Sign in to your secure voting portal account</p>
          </div>

          {/* Toggle Switch between Voter and Admin */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setIsAdminLogin(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 flex items-center justify-center space-x-2 text-sm font-semibold rounded-xl transition-all ${
                !isAdminLogin
                  ? 'bg-white dark:bg-slate-950 shadow-sm text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <FiUser className="w-4 h-4" />
              <span>Voter Login</span>
            </button>
            <button
              onClick={() => {
                setIsAdminLogin(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 flex items-center justify-center space-x-2 text-sm font-semibold rounded-xl transition-all ${
                isAdminLogin
                  ? 'bg-white dark:bg-slate-950 shadow-sm text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <FiSliders className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start space-x-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-150 dark:border-red-950/30 text-sm">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiMail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-950/50 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                    formik.touched.email && formik.errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="name@domain.com"
                  {...formik.getFieldProps('email')}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <Link to="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiLock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-white/50 dark:bg-slate-950/50 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  placeholder="••••••••"
                  {...formik.getFieldProps('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500">{formik.errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all text-sm mt-2 flex items-center justify-center space-x-2"
            >
              {formik.isSubmitting ? 'Signing In...' : `Sign In as ${isAdminLogin ? 'Admin' : 'Voter'}`}
            </button>
          </form>

          {/* Registration Redirect (only for Voters) */}
          {!isAdminLogin && (
            <div className="text-center pt-2">
              <p className="text-sm text-slate-400">
                Don't have an approved Voter profile?{' '}
                <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
                  Register Now
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
