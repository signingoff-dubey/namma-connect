import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login, checkAuth } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Get session_id from URL fragment
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (sessionId) {
        try {
          await login(sessionId);
          // Clean URL
          window.history.replaceState({}, document.title, '/callback');
          
          // Check if user has profile
          await checkAuth();
          
          toast.success('Welcome to MetroConnect!');
          navigate('/onboarding');
        } catch (error) {
          console.error('Auth error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/');
        }
      } else {
        // Check if already authenticated
        await checkAuth();
        navigate('/dashboard');
      }
      
      setProcessing(false);
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-green-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg font-medium">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
