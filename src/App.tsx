import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { LandingPage } from './components/landing/LandingPage';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { Profile } from './components/profile/Profile';

type PageType = 'landing' | 'auth' | 'dashboard' | 'profile';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && currentPage === 'landing') {
        setCurrentPage('dashboard');
      } else if (!user && (currentPage === 'dashboard' || currentPage === 'profile')) {
        setCurrentPage('landing');
      }
    }
  }, [user, loading, currentPage]);

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('auth');
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: PageType) => {
    if (page === 'auth' && user) {
      return; // Don't navigate to auth if already authenticated
    }
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'auth' && (
        <Header 
          currentPage={currentPage as 'landing' | 'dashboard' | 'profile'} 
          onNavigate={handleNavigate} 
        />
      )}
      
      {currentPage === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {currentPage === 'auth' && (
        <AuthForm onSuccess={handleAuthSuccess} />
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard />
      )}
      
      {currentPage === 'profile' && user && (
        <Profile />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;