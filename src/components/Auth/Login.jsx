import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, MapPin, Sparkles } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle specific Firebase error codes
      let errorMessage = 'Failed to ' + (isLogin ? 'sign in' : 'create account');
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Firebase configuration error. Please contact support';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Clock className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Soonish</h1>
          <p className="text-white/80 text-lg">Share your future plans</p>
          
          {/* Feature highlights */}
          <div className="flex justify-center space-x-6 mt-6 text-white/70">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Friends</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Places</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Plans</span>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
