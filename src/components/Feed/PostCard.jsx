import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostsContext';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Plane, 
  MoreHorizontal, 
  Trash2,
  ExternalLink 
} from 'lucide-react';

const postTypeConfig = {
  micro: {
    icon: Clock,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    label: 'Micro Plan'
  },
  event: {
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    label: 'Event'
  },
  travel: {
    icon: Plane,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    label: 'Travel'
  }
};

export default function PostCard({ post }) {
  const [showMenu, setShowMenu] = useState(false);
  const { currentUser } = useAuth();
  const { deletePost } = usePosts();
  
  const config = postTypeConfig[post.type];
  const Icon = config.icon;
  const isOwner = currentUser?.uid === post.userId;

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getTimeUntil = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'soon';
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePost(post.id);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
    setShowMenu(false);
  };

  return (
    <div className={`${config.bgColor} rounded-xl p-6 shadow-sm border border-gray-100 relative`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.userAvatar}
            alt={post.userName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-medium text-gray-900">{post.userName}</h3>
            <div className="flex items-center space-x-2">
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.textColor} bg-white/50`}>
                <Icon className="w-3 h-3" />
                <span>{config.label}</span>
              </div>
              <span className="text-xs text-gray-500">{getTimeUntil(post.startTime)}</span>
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-white/50 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
        
        {post.description && (
          <p className="text-gray-700">{post.description}</p>
        )}

        {/* Time and Location */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatDateTime(post.startTime)}</span>
            {post.endTime && (
              <>
                <span>→</span>
                <span>{formatDateTime(post.endTime)}</span>
              </>
            )}
          </div>
          
          {post.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{post.location.name}</span>
            </div>
          )}
        </div>

        {/* Metadata */}
        {post.metadata && (
          <div className="pt-3 border-t border-white/50">
            {post.metadata.ticketLink && (
              <a
                href={post.metadata.ticketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Event</span>
              </a>
            )}
            
            {post.metadata.flightNumber && (
              <div className="text-sm text-gray-600">
                Flight: {post.metadata.flightNumber}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
