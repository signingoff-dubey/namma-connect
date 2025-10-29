import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Building2, Users, MessageCircle, Hand, Filter, Bell, Settings, Home, Map } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState('purple');
  const [filters, setFilters] = useState({
    sameOrg: false,
    sameDest: false,
    travelingNow: false
  });

  useEffect(() => {
    fetchDiscoverUsers();
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(fetchDiscoverUsers, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchDiscoverUsers = async () => {
    try {
      const params = {};
      if (filters.sameDest) params.same_destination = true;
      
      const response = await axios.get(`${API}/discover`, { 
        params,
        withCredentials: true 
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWave = async (userId) => {
    try {
      await axios.post(`${API}/waves`, { to_user_id: userId }, { withCredentials: true });
      toast.success('Wave sent! 👋');
    } catch (error) {
      toast.error('Failed to send wave');
    }
  };

  const sendConnectionRequest = async (userId) => {
    try {
      await axios.post(`${API}/connections`, { connected_user_id: userId }, { withCredentials: true });
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" data-testid="dashboard">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2 rounded-xl">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Discover</h1>
              <p className="text-xs text-gray-500">Find fellow commuters</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition" data-testid="notifications-btn">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 transition" data-testid="settings-btn">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Metro Line Selector */}
      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Button 
              variant={selectedLine === 'purple' ? 'default' : 'outline'}
              className={selectedLine === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              onClick={() => setSelectedLine('purple')}
              data-testid="purple-line-btn"
            >
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              Purple Line
            </Button>
            <Button 
              variant={selectedLine === 'green' ? 'default' : 'outline'}
              className={selectedLine === 'green' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setSelectedLine('green')}
              data-testid="green-line-btn"
            >
              <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
              Green Line
            </Button>
            <Button 
              variant={selectedLine === 'yellow' ? 'default' : 'outline'}
              className={selectedLine === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              onClick={() => setSelectedLine('yellow')}
            >
              <div className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
              Yellow Line
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="container mx-auto flex gap-2 overflow-x-auto">
          <Button 
            size="sm" 
            variant={filters.sameOrg ? 'default' : 'outline'}
            className={filters.sameOrg ? 'bg-purple-600' : ''}
            onClick={() => setFilters({...filters, sameOrg: !filters.sameOrg})}
          >
            <Building2 className="w-4 h-4 mr-1" /> Same Organization
          </Button>
          <Button 
            size="sm" 
            variant={filters.sameDest ? 'default' : 'outline'}
            className={filters.sameDest ? 'bg-purple-600' : ''}
            onClick={() => setFilters({...filters, sameDest: !filters.sameDest})}
          >
            <MapPin className="w-4 h-4 mr-1" /> Same Destination
          </Button>
          <Button 
            size="sm" 
            variant={filters.travelingNow ? 'default' : 'outline'}
            className={filters.travelingNow ? 'bg-green-600' : ''}
            onClick={() => setFilters({...filters, travelingNow: !filters.travelingNow})}
          >
            <Map className="w-4 h-4 mr-1" /> Traveling Now
          </Button>
        </div>
      </div>

      {/* Discovery Cards */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <img 
              src="https://images.unsplash.com/photo-1549585919-02cde1aa3763?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxtZXRybyUyMGNvbW11dGUlMjBwZW9wbGV8ZW58MHx8fHwxNzYxNzEwNzU4fDA&ixlib=rb-4.1.0&q=85"
              alt="No connections"
              className="w-64 h-48 object-cover rounded-2xl mx-auto mb-6 opacity-60"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No commuters found</h3>
            <p className="text-gray-600">Try adjusting your filters or start a trip</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {users.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 border border-gray-100 card-hover"
                data-testid={`user-card-${index}`}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={item.user?.picture || item.profile?.profile_photo} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-lg">
                      {item.user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{item.user?.name || 'Anonymous'}</h3>
                        {item.profile?.organization_name && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Building2 className="w-4 h-4" />
                            {item.profile.organization_type === 'company' ? 'Works at' : 'Studies at'} {item.profile.organization_name}
                          </p>
                        )}
                      </div>
                      {item.profile?.is_verified && (
                        <Badge className="bg-blue-100 text-blue-700">Verified</Badge>
                      )}
                    </div>

                    {item.current_trip && (
                      <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-purple-900 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
                          Traveling now
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                          {item.current_trip.current_station} → {item.current_trip.to_station}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => sendWave(item.user.id)}
                        data-testid="wave-btn"
                      >
                        <Hand className="w-4 h-4 mr-1" /> Wave
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => sendConnectionRequest(item.user.id)}
                        data-testid="connect-btn"
                      >
                        <Users className="w-4 h-4 mr-1" /> Connect
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/messages/${item.user.id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
};

export default Dashboard;
