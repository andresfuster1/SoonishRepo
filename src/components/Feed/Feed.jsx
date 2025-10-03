import { useState } from 'react';
import { usePosts } from '../../contexts/PostsContext';
import PostCard from './PostCard';
import AddPostModal from './AddPostModal';
import { Plus, Clock } from 'lucide-react';

export default function Feed() {
  const { posts, loading } = usePosts();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What's coming up?</h1>
        <p className="text-gray-600">Share your future plans with friends</p>
      </div>

      {/* Add Post Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 px-6 rounded-xl font-medium hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2 shadow-lg"
      >
        <Plus className="w-5 h-5" />
        <span>Add a plan</span>
      </button>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
          <p className="text-gray-600 mb-4">Start sharing what you're up to!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Add Post Modal */}
      {showAddModal && (
        <AddPostModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
