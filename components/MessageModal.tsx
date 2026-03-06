import React, { useState } from 'react';

interface MessageModalProps {
    recipient: string;
    onSend: (content: string) => void;
    onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ recipient, onSend, onClose }) => {
    const [content, setContent] = useState('');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/40 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative border border-white/50 animate-pop-in">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark transition-colors p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="mb-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Send a note to</p>
                    <h3 className="text-3xl font-serif font-black text-brand-dark tracking-tight">{recipient}</h3>
                </div>

                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-40 p-6 bg-white border-2 border-gray-100 rounded-2xl focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none resize-none mb-6 text-lg font-serif text-gray-700 placeholder-gray-300 transition-all shadow-inner"
                    placeholder="Write something kind..."
                />
                
                <button 
                    onClick={() => { onSend(content); onClose(); }}
                    disabled={!content.trim()}
                    className="w-full py-4 bg-brand-dark text-white font-black rounded-2xl hover:bg-brand-lavender hover:scale-[1.02] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md"
                >
                    Send Message
                </button>
            </div>
        </div>
    );
};
