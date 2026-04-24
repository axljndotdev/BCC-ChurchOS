import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getConversations, getChatMessages, sendDirectMessage } from '../services/db';
import { ChatConversation, DirectMessage } from '../types';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Loader2, 
  User, 
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn } from '../lib/utils';

export default function MemberMessages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile) {
      const fetchConversations = async () => {
        try {
          const data = await getConversations(profile.uid);
          setConversations(data);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchConversations();
    }
  }, [profile]);

  useEffect(() => {
    if (profile && activeConversation) {
      const otherUserId = activeConversation.participantIds.find(id => id !== profile.uid);
      if (otherUserId) {
        const fetchMessages = async () => {
          setMessagesLoading(true);
          try {
            const data = await getChatMessages(profile.uid, otherUserId);
            setMessages(data);
          } catch (error) {
            console.error('Error fetching messages:', error);
          } finally {
            setMessagesLoading(false);
          }
        };
        fetchMessages();
      }
    }
  }, [activeConversation, profile]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || !activeConversation) return;

    const otherUserId = activeConversation.participantIds.find(id => id !== profile.uid);
    const otherUserName = activeConversation.participantNames.find(name => name !== profile.displayName);

    if (!otherUserId || !otherUserName) return;

    setSending(true);
    try {
      await sendDirectMessage({
        senderId: profile.uid,
        senderName: profile.displayName,
        senderPhoto: profile.photoURL,
        receiverId: otherUserId,
        receiverName: otherUserName,
        text: newMessage
      });
      setNewMessage('');
      // Refresh messages
      const data = await getChatMessages(profile.uid, otherUserId);
      setMessages(data);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.participantNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-maroon animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r border-slate-50 flex flex-col",
        activeConversation ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-slate-50">
          <h1 className="text-xl font-display font-bold text-slate-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-maroon/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => {
            const otherUserName = conv.participantNames.find(name => name !== profile?.displayName);
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={cn(
                  "w-full p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors text-left",
                  activeConversation?.id === conv.id && "bg-slate-50 border-r-2 border-maroon"
                )}
              >
                <div className="h-12 w-12 rounded-full bg-maroon/5 flex items-center justify-center text-maroon font-bold text-lg shrink-0">
                  {otherUserName?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-slate-900 truncate">{otherUserName}</p>
                    <p className="text-[10px] text-slate-400">{conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}</p>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            );
          })}
          {filteredConversations.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-light italic">No messages found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-50/30",
        !activeConversation ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {!activeConversation ? (
          <div className="text-center p-8">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
              <MessageSquare className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Your Inbox</h2>
            <p className="text-slate-500 font-light max-w-xs mx-auto">Select a conversation or start a new one from the Member Directory.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-2 text-slate-400 hover:text-maroon"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="h-10 w-10 rounded-full bg-maroon/5 flex items-center justify-center text-maroon font-bold">
                  {activeConversation.participantNames.find(name => name !== profile?.displayName)?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {activeConversation.participantNames.find(name => name !== profile?.displayName)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Partner</p>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-maroon">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 text-slate-200 animate-spin" />
                </div>
              ) : messages.map((msg, i) => {
                const isMine = msg.senderId === profile?.uid;
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      isMine ? "self-end items-end" : "self-start items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                      isMine 
                        ? "bg-maroon text-white rounded-tr-none" 
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                         {formatDate(msg.createdAt)}
                       </p>
                       {isMine && (
                         <div className="text-maroon">
                           {msg.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button 
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-3 bg-maroon text-white rounded-2xl shadow-lg shadow-maroon/20 hover:bg-maroon-dark transition-all disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
