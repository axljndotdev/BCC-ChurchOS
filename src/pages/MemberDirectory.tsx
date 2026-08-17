import { useState, useEffect } from 'react';
import { getUsers, sendDirectMessage } from '../services/db';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Search, Mail, Phone, MapPin, User, MessageSquare, Loader2, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function MemberDirectory() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Messaging state
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getUsers();
        // Only show active official members in directory
        setMembers(data.filter(m => m.status === 'active' && m.membershipStatus === 'official_member'));
      } catch (error) {
        console.error('Error fetching directory:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedMember || !messageText.trim()) return;

    setSending(true);
    try {
      await sendDirectMessage({
        senderId: profile.uid,
        senderName: profile.displayName,
        senderPhoto: profile.photoURL,
        receiverId: selectedMember.uid,
        receiverName: selectedMember.displayName,
        text: messageText
      });
      setMessageText('');
      setSelectedMember(null);
      navigate('/member/messages');
    } catch (error) {
      console.error('Error sending quick message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.ministry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900">Member Directory</h1>
        <p className="text-slate-500">Connect with your brothers and sisters in the Bethesda Family.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, title, or ministry..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.uid} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
               {/* Accent Background */}
               <div className="absolute top-0 right-0 h-24 w-24 bg-maroon rounded-full blur-3xl opacity-0 group-hover:opacity-5 transition-opacity" />
               
               <div className="flex items-center gap-4 mb-6">
                 <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-maroon font-display text-2xl font-bold ring-2 ring-slate-50 overflow-hidden">
                   {member.photoURL && member.photoURL !== "" ? (
                     <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                   ) : (
                     member.displayName.charAt(0)
                   )}
                 </div>
                 <div>
                   <h3 className="font-display font-bold text-slate-900 text-lg group-hover:text-maroon transition-colors">{member.displayName}</h3>
                   <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded">
                     {member.title}
                   </span>
                 </div>
               </div>

               <div className="space-y-3 mb-6">
                 {member.ministry && (
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                     <User className="h-4 w-4 text-slate-400" />
                     <span className="font-medium">{member.ministry}</span>
                   </div>
                 )}
                 <div className="flex items-center gap-2 text-sm text-slate-500">
                   <Mail className="h-4 w-4 text-slate-300" />
                   <span className="truncate">{member.email || 'Email not shared'}</span>
                 </div>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedMember(member)}
                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-maroon hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" /> Private Message
                  </button>
               </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <User className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-500">No members found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Message Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !sending && setSelectedMember(null)}
              className="fixed inset-0" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] z-10 my-auto"
            >
              <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-maroon/5 flex items-center justify-center text-maroon font-bold text-lg sm:text-xl border border-maroon/10 shrink-0">
                    {selectedMember.photoURL ? (
                      <img src={selectedMember.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      selectedMember.displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-tight">Message</h2>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest truncate max-w-[180px]">{selectedMember.displayName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  disabled={sending}
                  className="p-2 text-slate-400 hover:text-maroon hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-4 overscroll-contain">
                  <textarea
                    autoFocus
                    required
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm min-h-[120px] focus:ring-2 focus:ring-maroon/20 outline-none transition-all resize-none"
                    placeholder={`Write an encouraging word to ${selectedMember.displayName.split(' ')[0]}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sending}
                  />
                </div>

                <div className="shrink-0 px-6 py-4 sm:px-8 sm:py-5 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="w-full py-3.5 bg-maroon text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-maroon/20 hover:bg-maroon-dark transition-all disabled:opacity-50 text-sm"
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send Private Message
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

