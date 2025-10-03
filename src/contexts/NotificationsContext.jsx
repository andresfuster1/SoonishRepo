import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Check if Firebase is available
  if (!db) {
    return (
      <NotificationsContext.Provider value={{
        notifications: [],
        unreadCount: 0,
        loading: false,
        markAsRead: () => Promise.resolve(),
        markAllAsRead: () => Promise.resolve(),
        createNotification: () => Promise.resolve()
      }}>
        {children}
      </NotificationsContext.Provider>
    );
  }

  // Listen to user's notifications
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (userId, postId, type, message) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        postId,
        type,
        message,
        read: false,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
