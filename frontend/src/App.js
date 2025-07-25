import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { BarkadaProvider } from './context/BarkadaContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CallbackPage from './pages/CallbackPage';
import Analytics from './pages/Analytics';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';
import BarkadaPage from './pages/BarkadaPage';
import JoinSession from './pages/JoinSession';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ApiLimitModal from './components/ApiLimitModal';

function App() {
  const { user, loading } = useAuth();
  const [showApiLimitModal, setShowApiLimitModal] = useState(false);

  // Show modal after a short delay when app loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowApiLimitModal(true);
    }, 1000); // Show after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setShowApiLimitModal(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BarkadaProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {user && <Navbar />}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/barkada" replace /> : <Landing />} />
          <Route path="/callback" element={<CallbackPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          
          <Route path="/playlists" element={
            <ProtectedRoute>
              <Playlists />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/barkada" element={<BarkadaPage />} />
          
          <Route path="/join/:sessionCode" element={
            <JoinSession />
          } />
        </Routes>

        {/* API Limit Modal */}
        <ApiLimitModal 
          isOpen={showApiLimitModal} 
          onClose={closeModal} 
        />
      </div>
    </BarkadaProvider>
  );
}

export default App;