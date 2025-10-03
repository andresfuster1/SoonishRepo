import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const PostsContext = createContext();

export function usePosts() {
  return useContext(PostsContext);
}

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Check if Firebase is available
  if (!db) {
    return (
      <PostsContext.Provider value={{
        posts: [],
        loading: false,
        addPost: () => Promise.reject(new Error('Firebase not configured')),
        deletePost: () => Promise.reject(new Error('Firebase not configured'))
      }}>
        {children}
      </PostsContext.Provider>
    );
  }

  // Listen to posts from user and their friends
  useEffect(() => {
    if (!currentUser || !userProfile) {
      setLoading(false);
      return;
    }

    // Simplified query - just get all posts for now, filter client-side
    const q = query(
      collection(db, 'posts'),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate(),
      }));
      
      // Filter posts for user and friends, and remove expired posts
      const friendIds = userProfile.friends || [];
      const userIds = [currentUser.uid, ...friendIds];
      
      const now = new Date();
      const activePosts = postsData.filter(post => {
        // Only show posts from user and friends
        if (!userIds.includes(post.userId)) return false;
        
        // Filter out expired posts
        if (post.type === 'micro') {
          return post.startTime > now;
        }
        return post.endTime ? post.endTime > now : post.startTime > now;
      });
      
      setPosts(activePosts);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, userProfile]);

  const addPost = async (postData) => {
    if (!currentUser) return;

    const post = {
      ...postData,
      userId: currentUser.uid,
      userName: userProfile?.name || currentUser.displayName,
      userAvatar: userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
      startTime: Timestamp.fromDate(new Date(postData.startTime)),
      endTime: postData.endTime ? Timestamp.fromDate(new Date(postData.endTime)) : null,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, 'posts'), post);
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const value = {
    posts,
    loading,
    addPost,
    deletePost
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}
