import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, MessageCircle, UserMinus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [waves, setWaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
    fetchWaves();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(`${API}/connections`, { withCredentials: true });
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaves = async () => {
    try {
      const response = await axios.get(`${API}/waves`, { withCredentials: true });
      setWaves(response.data);
    } catch (error) {
      console.error('Error fetching waves:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" data-testid="connections-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
          <p className="text-sm text-gray-600 mt-1">Your metro community</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="connections" data-testid="connections-tab">Connections ({connections.length})</TabsTrigger>
            <TabsTrigger value="waves" data-testid="waves-tab">Waves ({waves.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
                <p className="text-gray-600">Start connecting with fellow commuters!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100" data-testid={`connection-${index}`}>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={item.user?.picture || item.profile?.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                          {item.user?.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.user?.name}</h3>
                        {item.profile?.organization_name && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {item.profile.organization_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Connected on {new Date(item.connection?.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <Button size="sm" variant="outline" data-testid="message-connection-btn">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="waves">
            {waves.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No waves received</h3>
                <p className="text-gray-600">When someone waves at you, it'll appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waves.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={item.user?.picture || item.profile?.profile_photo} />
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                          {item.user?.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.user?.name}</h3>
                        {item.profile?.organization_name && (
                          <p className="text-sm text-gray-600">{item.profile.organization_name}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Waved {new Date(item.wave?.timestamp).toLocaleTimeString()}
                        </p>
                      </div>

                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Wave Back
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav active="connections" />
    </div>
  );
};

export default Connections;
