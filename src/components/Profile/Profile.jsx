import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostsContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import PostCard from '../Feed/PostCard';
import ProfileSettingsModal from './ProfileSettingsModal';
import { User, Calendar, Users, MapPin, Settings } from 'lucide-react';

export default function Profile() {
  const { userProfile, currentUser } = useAuth();
  const { posts } = usePosts();
  const [userPosts, setUserPosts] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [stats, setStats] = useState({
    totalPlans: 0,
    friendsCount: 0,
    upcomingPlans: 0
  });

  useEffect(() => {
    if (currentUser && posts) {
      const myPosts = posts.filter(post => post.userId === currentUser.uid);
      setUserPosts(myPosts);
      
      setStats({
        totalPlans: myPosts.length,
        friendsCount: userProfile?.friends?.length || 0,
        upcomingPlans: myPosts.filter(post => new Date(post.startTime) > new Date()).length
      });
    }
  }, [currentUser, posts, userProfile]);

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twilight-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-twilight-500 to-sky-500 rounded-2xl p-8 text-white mb-6">
        <div className="flex items-center space-x-6">
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{userProfile.name}</h1>
            <p className="text-white/80 mb-4">{userProfile.email}</p>
            
            {/* Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalPlans}</div>
                <div className="text-sm text-white/80">Total Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.friendsCount}</div>
                <div className="text-sm text-white/80">Friends</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.upcomingPlans}</div>
                <div className="text-sm text-white/80">Upcoming</div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-lunar-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="font-semibold text-twilight-900">Recent Activity</h3>
          </div>
          <p className="text-sm text-twilight-600">
            {userPosts.length > 0 
              ? `Last plan: ${userPosts[0]?.title}` 
              : 'No plans yet'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-lunar-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-twilight-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-twilight-600" />
            </div>
            <h3 className="font-semibold text-twilight-900">Friends</h3>
          </div>
          <p className="text-sm text-twilight-600">
            {stats.friendsCount > 0 
              ? `${stats.friendsCount} friends connected` 
              : 'No friends yet'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-lunar-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-coral-600" />
            </div>
            <h3 className="font-semibold text-twilight-900">Locations</h3>
          </div>
          <p className="text-sm text-twilight-600">
            {userPosts.filter(p => p.location).length} places visited
          </p>
        </div>
      </div>

      {/* My Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-lunar-200">
        <div className="p-6 border-b border-lunar-200">
          <h2 className="text-xl font-semibold text-twilight-900">My Plans</h2>
        </div>
        
        <div className="p-6">
          {userPosts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-lunar-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-lunar-400" />
              </div>
              <h3 className="text-lg font-medium text-twilight-900 mb-2">No plans yet</h3>
              <p className="text-twilight-600">Start sharing your future plans with friends!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <ProfileSettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}
