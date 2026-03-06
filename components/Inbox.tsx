import React, { useEffect, useState } from 'react';
import { Message, User } from '../types';
import { storageService } from '../services/storageService';

interface InboxProps {
  currentUser: User;
  onReply: (sender: string) => void;
}

export const Inbox: React.FC<InboxProps> = ({ currentUser, onReply }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);

  useEffect(() => {
    storageService.getMessages(currentUser.username).then(setMessages);
  }, [currentUser]);

  useEffect(() => {
    if (selectedPartner) {
        storageService.getConversation(currentUser.username, selectedPartner).then(setConversation);
    }
  }, [selectedPartner, currentUser]);

  const handleMarkRead = async (id: string) => {
      await storageService.markAsRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const handleOpenConversation = (partner: string, msgId: string) => {
      handleMarkRead(msgId);
      setSelectedPartner(partner);
  };

  if (selectedPartner) {
      return (
        <div className="w-full max-w-4xl animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => setSelectedPartner(null)}
                    className="flex items-center gap-2 text-brand-dark font-bold hover:text-brand-lavender transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Inbox
                </button>
                <h2 className="text-3xl font-serif font-black text-brand-dark">Chat with {selectedPartner}</h2>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/60 min-h-[500px] flex flex-col relative overflow-hidden">
                <div className="flex-grow space-y-4 overflow-y-auto mb-20 pr-2 custom-scrollbar max-h-[60vh]">
                    {conversation.length === 0 ? (
                        <p className="text-center text-gray-500 italic">No messages yet.</p>
                    ) : (
                        conversation.map(msg => {
                            const isMe = msg.from === currentUser.username;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                                        isMe 
                                        ? 'bg-brand-dark text-white rounded-br-none' 
                                        : 'bg-white text-brand-dark border border-gray-100 rounded-bl-none shadow-sm'
                                    }`}>
                                        <p className="font-serif text-lg">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 font-bold opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-white/50 flex justify-center">
                    <button 
                        onClick={() => onReply(selectedPartner)}
                        className="bg-brand-dark text-white px-8 py-3 rounded-full font-black shadow-lg hover:bg-brand-lavender hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                        Reply to {selectedPartner}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full max-w-4xl animate-[fadeIn_0.5s_ease-out]">
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-5xl font-serif font-black text-brand-dark tracking-tight">Your Inbox</h1>
            <div className="bg-white/50 px-4 py-2 rounded-full font-bold text-brand-dark border border-white/60 shadow-sm">
                {messages.filter(m => !m.read).length} New
            </div>
        </div>
        
        {messages.length === 0 ? (
            <div className="text-center py-24 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-sm">
                <p className="text-gray-500 text-xl font-bold font-serif">It's quiet here... for now.</p>
            </div>
        ) : (
            <div className="grid gap-6">
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        onClick={() => handleOpenConversation(msg.from, msg.id)}
                        className={`p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                            msg.read 
                            ? 'bg-white/40 border-white/40 text-gray-500 hover:bg-white/60' 
                            : 'bg-white border-white/80 text-brand-dark shadow-xl scale-[1.02] hover:scale-[1.03] hover:shadow-2xl'
                        }`}
                    >
                        {!msg.read && (
                            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-mint/20 rounded-bl-[3rem] flex items-start justify-end p-4">
                                <div className="w-3 h-3 bg-brand-mint rounded-full animate-pulse shadow-[0_0_10px_rgba(0,245,212,0.6)]"></div>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${msg.read ? 'bg-gray-200 text-gray-500' : 'bg-brand-dark text-brand-brightGold'}`}>
                                    {msg.from.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <span className="font-black text-sm uppercase tracking-widest block">{msg.from}</span>
                                    <span className="text-[10px] font-bold opacity-60">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className={`font-serif text-xl leading-relaxed relative z-10 ${msg.read ? 'font-medium' : 'font-bold'}`}>
                            "{msg.content}"
                        </p>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
