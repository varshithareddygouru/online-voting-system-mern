import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiPhone, FiLock, FiCamera, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';

const UserProfile = () => {
  const { user, updateProfile, loading } = useContext(AuthContext);
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (password && password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setUpdating(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    
    if (password) {
      formData.append('password', password);
    }
    if (profileImageFile) {
      formData.append('profileImage', profileImageFile);
    }

    const res = await updateProfile(formData);
    
    if (res.success) {
      setSuccessMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setProfileImageFile(null);
      setProfilePreview(null);
    } else {
      setErrorMessage(res.message);
    }
    setUpdating(false);
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
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Profile</h2>
            <p className="text-sm text-slate-400">View and update your personal voter profile details.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Left side: Avatar and credentials Card */}
            <div className="p-6 rounded-3xl glass-card space-y-6 flex flex-col items-center text-center shadow-sm">
              <div className="relative">
                <img
                  src={profilePreview || (user?.profileImage ? `http://localhost:5000${user.profileImage}` : 'https://api.dicebear.com/7.x/initials/svg?seed=User')}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-2 border-brand-500 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=User';
                  }}
                />
                <label
                  htmlFor="avatarUpload"
                  className="absolute bottom-0 right-0 p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer shadow-md transition-colors"
                >
                  <FiCamera className="w-4.5 h-4.5" />
                </label>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.fullName}</h3>
                <span className="text-xs px-2.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-full font-semibold text-slate-500 dark:text-slate-400">
                  {user?.role === 'admin' ? 'Administrator' : 'Registered Voter'}
                </span>
              </div>

              <div className="w-full text-left space-y-3 pt-4 border-t border-slate-100 dark:border-slate-900/50 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</span>
                  <span className="text-sm text-slate-800 dark:text-white font-medium">{user?.email}</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider mb-0.5">Voter ID</span>
                  <span className="text-sm font-mono text-slate-800 dark:text-white font-medium">{user?.voterId}</span>
                </div>
                {user?.aadhaarCard && (
                  <div>
                    <span className="block font-bold text-slate-400 uppercase tracking-wider mb-0.5">Aadhaar Card</span>
                    <span className="text-sm text-slate-800 dark:text-white font-medium">{user?.aadhaarCard}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Form Card */}
            <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl glass-card shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>

              {successMessage && (
                <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-150 dark:border-green-950/30 text-sm">
                  <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-150 dark:border-red-950/30 text-sm">
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <FiUser className="w-5 h-5" />
                      </span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <FiPhone className="w-5 h-5" />
                      </span>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase">New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <FiLock className="w-5 h-5" />
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase">Confirm New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <FiLock className="w-5 h-5" />
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white rounded-xl font-bold shadow-md shadow-brand-500/10 transition-colors text-sm"
                  >
                    {updating ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
