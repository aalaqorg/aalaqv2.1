"use client";
import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useUser } from '../../contexts/UserContext';
import { PublishedStory } from '../../types';
import { useRouter } from 'next/navigation';
import { StoryModal } from '../../components/StoryModal';

export default function DashboardPage() {
    const { user, myStories } = useUser();
    const router = useRouter();
    const [selectedStory, setSelectedStory] = useState<PublishedStory | null>(null);

    if (!user) {
        return (
            <AppShell>
                <div className="text-center py-20">
                    <h2 className="text-3xl font-bold mb-4">Please login to view your dashboard.</h2>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="w-full max-w-5xl animate-[fadeIn_0.5s_ease-out]">
                <div className="flex justify-between items-end mb-10 border-b border-black/5 pb-6">
                    <div>
                        <h1 className="text-4xl font-serif font-black text-brand-dark tracking-tight">Hello, {user.username}</h1>
                        <p className="text-gray-600 font-bold mt-2">You have published {myStories.length}/3 stories.</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (myStories.length >= 3) {
                                alert("You have reached the limit of 3 stories!");
                                return;
                            }
                            router.push('/create');
                        }}
                        disabled={myStories.length >= 3}
                        className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        Write New Story
                    </button>
                </div>

                {myStories.length === 0 ? (
                    <div className="text-center py-24 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-sm">
                        <p className="text-gray-500 text-xl font-bold mb-4">You haven't written any stories yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {myStories.map(story => (
                            <div 
                                key={story.id} 
                                className="relative group cursor-pointer"
                                onClick={() => setSelectedStory(story)}
                            >
                                <div className="relative bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] flex justify-between items-center border border-white/60 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                                    <div>
                                        <h3 className="text-2xl font-serif font-bold text-brand-dark group-hover:text-brand-lavender transition-colors">{story.title}</h3>
                                        <div className="flex gap-4 mt-3 text-sm font-bold text-gray-500">
                                            <span>{story.votes} votes</span>
                                            <span>{new Date(story.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-brand-dark text-xs uppercase font-black tracking-widest bg-brand-brightGold px-4 py-2 rounded-full group-hover:bg-brand-lavender group-hover:text-white transition-colors">Read</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedStory && (
                <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
            )}
        </AppShell>
    );
}