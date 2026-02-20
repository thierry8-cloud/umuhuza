import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Search, MessageCircle, ArrowLeft } from 'lucide-react';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(createPageUrl('Messages'));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const sent = await base44.entities.Message.filter({ sender_id: user.id }, '-created_date');
      const received = await base44.entities.Message.filter({ receiver_id: user.id }, '-created_date');
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const grouped = {};
    messages.forEach(msg => {
      const key = msg.conversation_id;
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          messages: [],
          otherUser: msg.sender_id === user?.id 
            ? { id: msg.receiver_id, name: msg.receiver_name, email: msg.receiver_email }
            : { id: msg.sender_id, name: msg.sender_name, email: msg.sender_email },
          product: { id: msg.product_id, title: msg.product_title },
          unreadCount: 0
        };
      }
      grouped[key].messages.push(msg);
      if (msg.receiver_id === user?.id && !msg.is_read) {
        grouped[key].unreadCount++;
      }
    });
    
    return Object.values(grouped).sort((a, b) => 
      new Date(b.messages[0]?.created_date) - new Date(a.messages[0]?.created_date)
    );
  }, [messages, user]);

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    await base44.entities.Message.create({
      sender_id: user.id,
      sender_name: user.full_name,
      sender_email: user.email,
      receiver_id: currentConversation.otherUser.id,
      receiver_name: currentConversation.otherUser.name,
      receiver_email: currentConversation.otherUser.email,
      product_id: currentConversation.product.id,
      product_title: currentConversation.product.title,
      content: newMessage,
      conversation_id: currentConversation.id
    });

    setNewMessage('');
    queryClient.invalidateQueries(['messages']);
  };

  const markAsRead = async (conversationId) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      const unreadMessages = conv.messages.filter(m => m.receiver_id === user?.id && !m.is_read);
      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, { is_read: true });
      }
      queryClient.invalidateQueries(['messages']);
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedConversation(id);
    markAsRead(id);
  };

  const filteredConversations = conversations.filter(c =>
    c.otherUser.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.product.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Ubutumwa</h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={`w-full md:w-96 border-r ${selectedConversation ? 'hidden md:block' : ''}`}>
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Shakisha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-0"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-73px)]">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nta butumwa ufite</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map(conv => (
                      <motion.button
                        key={conv.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedConversation === conv.id ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {getInitials(conv.otherUser.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900 truncate">
                                {conv.otherUser.name}
                              </span>
                              {conv.unreadCount > 0 && (
                                <Badge className="bg-emerald-500 h-5 px-2">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-emerald-600 font-medium truncate mb-1">
                              {conv.product.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {conv.messages[0]?.content}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
              {selectedConversation && currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {getInitials(currentConversation.otherUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{currentConversation.otherUser.name}</h3>
                      <p className="text-sm text-emerald-600">{currentConversation.product.title}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {currentConversation.messages
                        .slice()
                        .reverse()
                        .map((msg, idx) => {
                          const isMe = msg.sender_id === user.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                  isMe
                                    ? 'bg-emerald-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-500'}`}>
                                  {new Date(msg.created_date).toLocaleTimeString('rw-RW', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Andika ubutumwa..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ubutumwa bwawe</h3>
                    <p className="text-gray-500">Hitamo conversation ureba ubutumwa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}