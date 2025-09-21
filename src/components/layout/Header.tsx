import React from 'react';
import { LogOut, User, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  currentPage: 'landing' | 'dashboard' | 'profile';
  onNavigate: (page: 'landing' | 'dashboard' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SkillSyncer</span>
          </div>

          {user && (
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <User className="h-4 w-4 inline mr-1" />
                Profile
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};