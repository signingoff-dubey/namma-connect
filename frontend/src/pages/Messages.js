import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/messages`, { withCredentials: true });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20" data-testid="messages-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="search-messages-input"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">Start a conversation with your connections</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conv, index) => (
              <button
                key={index}
                onClick={() => navigate(`/messages/${conv.user.id}`)}
                className="w-full bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition text-left"
                data-testid={`conversation-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.user?.picture || conv.profile?.profile_photo} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                        {conv.user?.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.user?.name}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.last_message?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{conv.last_message?.content}</p>
                      {conv.unread_count > 0 && (
                        <Badge className="bg-purple-600 text-white ml-2">{conv.unread_count}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="messages" />
    </div>
  );
};

export default Messages;
