import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages/${userId}`, { withCredentials: true });
      setMessages(response.data);
      
      // Get other user info from first message
      if (response.data.length > 0) {
        const firstMsg = response.data[0];
        const otherUserId = firstMsg.from_user_id === currentUser.id ? firstMsg.to_user_id : firstMsg.from_user_id;
        // Fetch user profile here if needed
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        `${API}/messages`,
        { to_user_id: userId, content: newMessage },
        { withCredentials: true }
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" data-testid="chat-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/messages')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">U</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">User</h2>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.from_user_id === currentUser?.id;
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1"
            data-testid="message-input"
          />
          <Button 
            size="icon" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={sendMessage}
            data-testid="send-message-btn"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
