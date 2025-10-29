import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Train, Users, Shield, Zap } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const handleGetStarted = () => {
    const redirectUrl = `${window.location.origin}/callback`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen gradient-purple-green relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Logo and tagline */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-white/90 p-4 rounded-2xl shadow-lg">
              <Train className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">MetroConnect</h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-700 font-medium">Connect. Commute. Collaborate.</p>
        </div>

        {/* Hero illustration */}
        <div className="mb-12 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <img 
            src="https://images.unsplash.com/photo-1602244314547-473f532b7bfa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxiYW5nYWxvcmUlMjBtZXRybyUyMHRyYWlufGVufDB8fHx8MTc2MTcxMDc1MXww&ixlib=rb-4.1.0&q=85"
            alt="Bangalore Metro"
            className="rounded-3xl shadow-2xl w-full max-w-2xl h-64 object-cover"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 w-full max-w-4xl animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center shadow-lg card-hover">
            <Users className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Meet Fellow Commuters</h3>
            <p className="text-sm text-gray-600">Connect with colleagues and classmates on your route</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center shadow-lg card-hover">
            <Shield className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Safe & Verified</h3>
            <p className="text-sm text-gray-600">Organization-verified profiles with privacy controls</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl text-center shadow-lg card-hover">
            <Zap className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">See who's traveling on your metro line right now</p>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-12 py-6 text-lg rounded-full shadow-xl"
            onClick={handleGetStarted}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            data-testid="get-started-btn"
          >
            Get Started with Google
            <svg className={`ml-2 w-5 h-5 transition-transform ${isHovering ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-gray-600 text-sm mt-8 text-center max-w-md">
          By continuing, you agree to our Terms of Service and Privacy Policy. Your data is secure and never shared without your consent.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
