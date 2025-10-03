import { useNotifications } from '../../contexts/NotificationsContext';
import { Bell, Users, Clock, MapPin, Check, CheckCheck } from 'lucide-react';

const notificationIcons = {
  overlap: Users,
  reminder: Clock,
  friend_request: Users,
  default: Bell
};

const notificationColors = {
  overlap: 'text-purple-600 bg-purple-100',
  reminder: 'text-blue-600 bg-blue-100',
  friend_request: 'text-green-600 bg-green-100',
  default: 'text-gray-600 bg-gray-100'
};

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">{unreadCount} unread</p>
            )}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-600">We'll notify you when friends have overlapping plans!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || notificationIcons.default;
            const colorClass = notificationColors[notification.type] || notificationColors.default;
            
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.read 
                    ? 'bg-white border-gray-200' 
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
