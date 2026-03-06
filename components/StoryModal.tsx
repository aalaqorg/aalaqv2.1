import React from 'react';
import { PublishedStory } from '../types';

interface StoryModalProps {
    story: PublishedStory;
    onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ story, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-brand-dark/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
            <div className="flex min-h-full items-center justify-center p-4 py-12">
                <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl relative animate-pop-in border border-white/50 overflow-hidden">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 bg-white/80 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-md"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    
                    <div className="relative bg-brand-primary p-12 pb-24">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-mint via-brand-brightGold to-brand-lavender opacity-20 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-arabesque opacity-10"></div>
                        
                        <div className="relative z-10 text-center text-white">
                            <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest mb-4">Written by {story.author}</span>
                            <h2 className="text-4xl md:text-6xl font-serif font-black mb-4 leading-snug">{story.title}</h2>
                            <div className="flex justify-center items-center gap-6 text-white/80 font-bold text-sm">
                                <span>{story.votes} Loves</span>
                                <span>{new Date(story.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 md:px-16 py-12 -mt-12 relative z-20">
                        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100">
                            <div className="prose prose-lg font-serif text-gray-800 leading-loose">
                                {(story.storyContent || '').split('
').map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>

                            {story.references && story.references.length > 0 && (
                                <div className="mt-12 pt-12 border-t border-gray-100">
                                    <h4 className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Inspiration from the Source</h4>
                                    <div className="grid gap-6">
                                        {story.references.map((ref, idx) => (
                                            <div key={idx} className="bg-brand-cream p-6 rounded-2xl border-l-4 border-brand-brightGold relative">
                                                <p className="text-xl font-serif italic text-brand-dark mb-3 relative z-10">"{ref.text}"</p>
                                                <p className="text-sm font-bold text-brand-accent text-right uppercase tracking-wider relative z-10">— {ref.source}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-brand-dark p-10 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-arabesque opacity-5"></div>
                            <div className="relative z-10 max-w-2xl mx-auto">
                            <p className="text-xs font-black text-brand-brightGold uppercase tracking-widest mb-4">The Lesson</p>
                            <p className="text-2xl md:text-3xl font-serif font-bold text-white italic">"{story.moral}"</p>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
