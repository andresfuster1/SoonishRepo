import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Home, Map, Bell, User, Users, LogOut, Settings } from 'lucide-react';
import ProfileSettingsModal from '../Profile/ProfileSettingsModal';

export default function Navbar() {
  const { logout, userProfile } = useAuth();
  const location = useLocation();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-lunar-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-twilight-500 to-sky-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-twilight-600 to-sky-600 bg-clip-text text-transparent">
              Soonish
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-twilight-100 text-twilight-700'
                    : 'text-twilight-600 hover:text-twilight-900 hover:bg-lunar-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {userProfile && (
              <div className="flex items-center space-x-2">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden sm:block text-sm font-medium text-twilight-700">
                  {userProfile.name}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-twilight-600 hover:text-twilight-900 hover:bg-lunar-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-twilight-600 hover:text-twilight-900 hover:bg-lunar-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-lunar-200">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors ${
                location.pathname === path
                  ? 'text-twilight-600'
                  : 'text-twilight-600 opacity-70'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      <ProfileSettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </nav>
  );
}
