import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PostsProvider } from './contexts/PostsContext';
import { NotificationsProvider } from './contexts/NotificationsProvider';
import Navbar from './components/layout/Navbar';
import Feed from './components/Feed/Feed';
import MapView from './components/Map/MapView';
import Profile from './components/Profile/Profile';
import Notifications from './components/Notifications/Notifications';
import FriendsList from './components/Friends/FriendsList';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <NotificationsProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <div className="flex flex-col h-screen">
                      <Navbar />
                      <main className="flex-1 overflow-hidden">
                        <Routes>
                          <Route path="/" element={<Feed />} />
                          <Route path="/map" element={<MapView />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="/friends" element={<FriendsList />} />
                        </Routes>
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </NotificationsProvider>
      </PostsProvider>
    </AuthProvider>
  );
}

export default App;
