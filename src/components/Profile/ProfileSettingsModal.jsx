import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Camera, Eye, EyeOff, Save, User, Mail, Lock, Shield, Upload } from 'lucide-react';

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { userProfile, updateUserProfile, updateUserPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // public, friends, private
    showLocation: true,
    showFriends: true,
    allowFriendRequests: true,
    showActivity: true
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        username: userProfile.username || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        avatarUrl: userProfile.avatarUrl || ''
      });
      
      setPrivacySettings({
        profileVisibility: userProfile.privacy?.profileVisibility || 'public',
        showLocation: userProfile.privacy?.showLocation !== false,
        showFriends: userProfile.privacy?.showFriends !== false,
        allowFriendRequests: userProfile.privacy?.allowFriendRequests !== false,
        showActivity: userProfile.privacy?.showActivity !== false
      });
    }
  }, [isOpen, userProfile]);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Validate form
      const newErrors = {};
      if (!profileForm.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!profileForm.email.trim()) {
        newErrors.email = 'Email is required';
      }
      if (profileForm.username && profileForm.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await updateUserProfile({
        ...profileForm,
        privacy: privacySettings
      });
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Validate password form
      const newErrors = {};
      if (!passwordForm.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!passwordForm.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwordForm.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await updateUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateNewAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setProfileForm(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-twilight-500 to-sky-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-mint-100 border border-mint-300 text-mint-800 px-4 py-3 mx-6 mt-4 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-coral-100 border border-coral-300 text-coral-800 px-4 py-3 mx-6 mt-4 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-lunar-200">
          <div className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-twilight-500 text-twilight-600'
                      : 'border-transparent text-twilight-500 hover:text-twilight-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={profileForm.avatarUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-lunar-200"
                  />
                  <button
                    type="button"
                    onClick={generateNewAvatar}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-twilight-500 hover:bg-twilight-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-twilight-900 mb-1">Profile Picture</h3>
                  <p className="text-sm text-twilight-600 mb-2">Click the camera icon to generate a new avatar</p>
                  <button
                    type="button"
                    onClick={generateNewAvatar}
                    className="text-sm text-twilight-600 hover:text-twilight-800 underline"
                  >
                    Generate New Avatar
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-twilight-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 ${
                      errors.name ? 'border-coral-500' : 'border-lunar-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-coral-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-twilight-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 ${
                      errors.username ? 'border-coral-500' : 'border-lunar-300'
                    }`}
                    placeholder="Choose a username"
                  />
                  {errors.username && <p className="text-coral-600 text-sm mt-1">{errors.username}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-twilight-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 ${
                    errors.email ? 'border-coral-500' : 'border-lunar-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-coral-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-twilight-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-lunar-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-twilight-500 hover:bg-twilight-600 disabled:bg-twilight-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-twilight-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 ${
                      errors.currentPassword ? 'border-coral-500' : 'border-lunar-300'
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-twilight-400 hover:text-twilight-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-coral-600 text-sm mt-1">{errors.currentPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-twilight-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 ${
                      errors.newPassword ? 'border-coral-500' : 'border-lunar-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-twilight-400 hover:text-twilight-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-coral-600 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-twilight-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-twilight-500 ${
                      errors.confirmPassword ? 'border-coral-500' : 'border-lunar-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-twilight-400 hover:text-twilight-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-coral-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-twilight-500 hover:bg-twilight-600 disabled:bg-twilight-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-twilight-700 mb-3">
                  Profile Visibility
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
                    { value: 'friends', label: 'Friends Only', description: 'Only your friends can see your profile' },
                    { value: 'private', label: 'Private', description: 'Only you can see your profile' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={privacySettings.profileVisibility === option.value}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                        className="mt-1 text-twilight-500 focus:ring-twilight-500"
                      />
                      <div>
                        <div className="font-medium text-twilight-900">{option.label}</div>
                        <div className="text-sm text-twilight-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-twilight-700">Privacy Controls</h3>
                
                {[
                  { key: 'showLocation', label: 'Show Location', description: 'Allow others to see your location in posts' },
                  { key: 'showFriends', label: 'Show Friends', description: 'Allow others to see your friends list' },
                  { key: 'allowFriendRequests', label: 'Allow Friend Requests', description: 'Let others send you friend requests' },
                  { key: 'showActivity', label: 'Show Activity', description: 'Allow others to see your recent activity' }
                ].map((setting) => (
                  <label key={setting.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings[setting.key]}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, [setting.key]: e.target.checked }))}
                      className="mt-1 text-twilight-500 focus:ring-twilight-500 rounded"
                    />
                    <div>
                      <div className="font-medium text-twilight-900">{setting.label}</div>
                      <div className="text-sm text-twilight-600">{setting.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleProfileSubmit}
                disabled={loading}
                className="w-full bg-twilight-500 hover:bg-twilight-600 disabled:bg-twilight-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Save Privacy Settings</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
