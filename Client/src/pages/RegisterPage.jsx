import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiCreditCard, FiLock, FiCamera, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const RegisterPage = () => {
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { register, token, role } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if logged in
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
      fullName: '',
      email: '',
      phone: '',
      voterId: '',
      aadhaarCard: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string()
        .matches(/^[0-9+() -]+$/, 'Invalid phone number format')
        .required('Phone number is required'),
      voterId: Yup.string()
        .min(6, 'Voter ID must be at least 6 characters')
        .required('Voter ID is required'),
      aadhaarCard: Yup.string(),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMessage('');
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('voterId', values.voterId);
      formData.append('aadhaarCard', values.aadhaarCard);
      formData.append('password', values.password);

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await register(formData);

      if (res.success) {
        setSuccessMessage(res.message);
        formik.resetForm();
        setProfileImageFile(null);
        setProfilePreview(null);
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setErrorMessage(res.message);
      }
      setSubmitting(false);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must be under 5MB');
        return;
      }
      setProfileImageFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl p-8 rounded-3xl glass-card shadow-2xl space-y-6 animate-slide-up">
          {/* Headline */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Register Voter Profile</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Submit your credentials for secure verification. All registrations require administrator review.
            </p>
          </div>

          {/* Banner Messages */}
          {errorMessage && (
            <div className="flex items-start space-x-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30 text-sm">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start space-x-2.5 p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-950/30 text-sm">
              <FiCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMessage} Redirection to Login in 5 seconds...</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            {/* Image Upload Area */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative">
                <img
                  src={profilePreview || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                  alt="Avatar Preview"
                  className="w-28 h-28 rounded-full object-cover border-2 border-brand-500 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=User';
                  }}
                />
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer shadow-md transition-colors"
                >
                  <FiCamera className="w-4 h-4" />
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">Profile Photo</span>
            </div>

            {/* Inputs Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiUser className="w-5 h-5" />
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="John Doe"
                    {...formik.getFieldProps('fullName')}
                  />
                </div>
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-xs text-red-500">{formik.errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiMail className="w-5 h-5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="john@example.com"
                    {...formik.getFieldProps('email')}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-red-500">{formik.errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiPhone className="w-5 h-5" />
                  </span>
                  <input
                    id="phone"
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="+1 (555) 000-0000"
                    {...formik.getFieldProps('phone')}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-xs text-red-500">{formik.errors.phone}</p>
                )}
              </div>

              {/* Voter ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Voter ID Card Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiCreditCard className="w-5 h-5" />
                  </span>
                  <input
                    id="voterId"
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="VTR9823412"
                    {...formik.getFieldProps('voterId')}
                  />
                </div>
                {formik.touched.voterId && formik.errors.voterId && (
                  <p className="text-xs text-red-500">{formik.errors.voterId}</p>
                )}
              </div>

              {/* Aadhaar (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Aadhaar Card Number (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiCreditCard className="w-5 h-5" />
                  </span>
                  <input
                    id="aadhaarCard"
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="1234 5678 9012"
                    {...formik.getFieldProps('aadhaarCard')}
                  />
                </div>
              </div>

              {/* Dummy space / empty grid cell */}
              <div className="hidden md:block"></div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiLock className="w-5 h-5" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="••••••••"
                    {...formik.getFieldProps('password')}
                  />
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-500">{formik.errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiLock className="w-5 h-5" />
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="••••••••"
                    {...formik.getFieldProps('confirmPassword')}
                  />
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all text-sm flex items-center justify-center space-x-2"
            >
              {formik.isSubmitting ? 'Submitting Registration...' : 'Register Profile'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
