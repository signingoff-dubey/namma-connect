import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, MessageCircle, Map, User } from 'lucide-react';

const BottomNav = ({ active }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Home, path: '/dashboard' },
    { id: 'trips', label: 'Trips', icon: Map, path: '/trips' },
    { id: 'connections', label: 'Connections', icon: Users, path: '/connections' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-4 transition ${
                isActive ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : 'stroke-1'}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-purple-600 rounded-full mt-1"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
