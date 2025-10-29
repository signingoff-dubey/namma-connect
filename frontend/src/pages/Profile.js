import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Clock, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ trips: 0, connections: 0 });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`, { withCredentials: true });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [tripsRes, connectionsRes] = await Promise.all([
        axios.get(`${API}/trips`, { withCredentials: true }),
        axios.get(`${API}/connections`, { withCredentials: true })
      ]);
      setStats({
        trips: tripsRes.data.length,
        connections: connectionsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" data-testid="profile-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 pt-12 pb-24 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-white/20 rounded-full transition"
              data-testid="settings-icon-btn"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="container mx-auto px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={user?.picture || profile?.profile_photo} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-3xl">
                {user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name || user?.name}</h2>
            {profile?.age && <p className="text-gray-600 mt-1">{profile.age} years old</p>}
            <div className="flex items-center gap-2 mt-2">
              {profile?.is_verified && (
                <Badge className="bg-blue-100 text-blue-700">Verified</Badge>
              )}
              {user?.email && (
                <Badge variant="outline" className="text-gray-600">{user.email}</Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.trips}</p>
              <p className="text-sm text-gray-600 mt-1">Total Trips</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.connections}</p>
              <p className="text-sm text-gray-600 mt-1">Connections</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mt-6">
            {profile?.organization_name && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.organization_type === 'company' ? 'Works at' : 'Studies at'}
                  </p>
                  <p className="text-sm text-gray-600">{profile.organization_name}</p>
                  {profile.designation && (
                    <p className="text-xs text-gray-500 mt-1">{profile.designation}</p>
                  )}
                </div>
              </div>
            )}

            {profile?.home_station && profile?.work_station && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Regular Route</p>
                  <p className="text-sm text-gray-600">{profile.home_station} → {profile.work_station}</p>
                </div>
              </div>
            )}

            {profile?.commute_times && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Commute Times</p>
                  <p className="text-sm text-gray-600">
                    Morning: {profile.commute_times.morning || 'Not set'} | Evening: {profile.commute_times.evening || 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* About */}
          {profile?.bio && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">About</p>
              <p className="text-sm text-gray-700">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-gray-700">{interest}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full mt-6 border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          data-testid="logout-btn"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <BottomNav active="profile" />
    </div>
  );
};

export default Profile;
