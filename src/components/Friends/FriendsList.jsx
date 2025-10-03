import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, UserPlus, Search, Check, X, Clock } from 'lucide-react';

export default function FriendsList() {
  const { userProfile, currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  // Load friends data
  useEffect(() => {
    loadFriends();
  }, [userProfile]);

  const loadFriends = async () => {
    if (!userProfile?.friends?.length) {
      setFriends([]);
      return;
    }

    try {
      const friendsData = [];
      for (const friendId of userProfile.friends) {
        const friendDoc = await getDocs(query(
          collection(db, 'users'),
          where('id', '==', friendId)
        ));
        
        if (!friendDoc.empty) {
          friendsData.push(friendDoc.docs[0].data());
        }
      }
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const snapshot = await getDocs(q);
      
      const results = snapshot.docs
        .map(doc => doc.data())
        .filter(user => 
          user.id !== currentUser?.uid &&
          !userProfile?.friends?.includes(user.id) &&
          (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10);
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setLoading(false);
  };

  const addFriend = async (friendId) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: arrayUnion(friendId)
      });
      
      // Also add current user to friend's list
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayUnion(currentUser.uid)
      });
      
      // Refresh friends list
      loadFriends();
      
      // Remove from search results
      setSearchResults(prev => prev.filter(user => user.id !== friendId));
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: arrayRemove(friendId)
      });
      
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayRemove(currentUser.uid)
      });
      
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchUsers(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <p className="text-gray-600">Connect with friends to see overlapping plans</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'friends'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Add Friends
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
              <p className="text-gray-600 mb-4">Add friends to see when your plans overlap!</p>
              <button
                onClick={() => setActiveTab('search')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Find Friends
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {friends.map((friend) => (
                <div key={friend.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{friend.name}</h3>
                      <p className="text-sm text-gray-600">{friend.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove friend"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Search by name or email..."
            />
          </div>

          {/* Search Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 text-center">
                {searchQuery ? (
                  <>
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No users found for "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Search for friends by name or email</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchResults.map((user) => (
                  <div key={user.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addFriend(user.id)}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Friend</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
