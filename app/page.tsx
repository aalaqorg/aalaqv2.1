"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../components/AppShell';
import { Storybook } from '../components/Storybook';
import { MessageModal } from '../components/MessageModal';
import { useUser } from '../contexts/UserContext';
import { PublishedStory } from '../types';
import { storageService } from '../services/storageService';
import { StoryModal } from '../components/StoryModal';

export default function Home() {
    const { user, setShowAuthModal } = useUser();
    const router = useRouter();
    const [messageRecipient, setMessageRecipient] = useState<string | null>(null);
    const [selectedStory, setSelectedStory] = useState<PublishedStory | null>(null);

    const handleSendMessage = async (content: string) => {
        if (user && messageRecipient) {
            try {
                await storageService.sendMessage(user.username, messageRecipient, content);
                alert("Message sent!");
                setMessageRecipient(null);
            } catch (e) {
                alert("Failed to send message.");
            }
        }
    };

    const handleRemix = (story: PublishedStory) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        router.push(`/create?remixId=${story.id}`);
    };

    return (
        <AppShell>
            <div className="w-full max-w-4xl mb-20 mt-8 animate-float">
                    <div 
                        onClick={() => {
                            if (user) router.push('/create');
                            else setShowAuthModal(true);
                        }}
                        className="group cursor-pointer relative bg-white/10 backdrop-blur-2xl rounded-[48px] p-16 text-center shadow-2xl border border-white/20 overflow-hidden hover:scale-[1.02] transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-arabesque opacity-5 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-mint/10 via-brand-brightGold/10 to-brand-lavender/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <h1 className="text-6xl md:text-8xl font-serif font-black text-brand-dark mb-6 relative z-10 tracking-tight leading-none drop-shadow-sm">
                            What's your story?
                        </h1>
                        <p className="text-gray-700 text-xl font-sans font-bold relative z-10 group-hover:text-brand-dark transition-colors tracking-wide">
                            Tap to weave a new tale inspired by wisdom.
                        </p>
                        
                        <div className="mt-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-dark text-brand-brightGold shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                </div>

            <Storybook 
                currentUser={user}
                onReadMoreAuthTrigger={() => setShowAuthModal(true)}
                onMessageAuthor={(author) => setMessageRecipient(author)}
                onRemix={handleRemix}
                onOpenStory={setSelectedStory}
            />

            {messageRecipient && (
                <MessageModal 
                    recipient={messageRecipient}
                    onSend={handleSendMessage}
                    onClose={() => setMessageRecipient(null)}
                />
            )}

            {selectedStory && (
                <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
            )}
        </AppShell>
    );
}