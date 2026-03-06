import React, { useState } from 'react';
import { StoryResponse } from '../types';

interface StoryEditorProps {
  initialStory: StoryResponse;
  onPublish: (finalStory: StoryResponse) => void;
  onCancel: () => void;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({ initialStory, onPublish, onCancel }) => {
  const [story, setStory] = useState<StoryResponse>(initialStory);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStory({ ...story, storyContent: e.target.value });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStory({ ...story, title: e.target.value });
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-[fadeInUp_0.5s_ease-out]">
      <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white/40 border-b border-white/50 p-8 flex justify-between items-center backdrop-blur-md">
            <h3 className="text-2xl font-serif font-black text-brand-dark tracking-tight">Polishing Your Gem</h3>
            <div className="flex gap-4">
                <button 
                    onClick={onCancel} 
                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100/50 hover:text-red-500 transition-colors"
                >
                    Discard
                </button>
                <button 
                    onClick={() => onPublish(story)}
                    className="bg-brand-dark text-white px-8 py-3 rounded-xl font-black shadow-lg hover:scale-105 hover:rotate-1 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>Publish Story</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

        <div className="p-10 space-y-8">
            {/* Title Input */}
            <div className="group">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Story Title</label>
                <input 
                    type="text" 
                    value={story.title} 
                    onChange={(e) => setStory({ ...story, title: e.target.value })}
                    className="w-full text-4xl md:text-5xl font-serif font-black text-brand-dark bg-transparent border-b-2 border-transparent hover:border-brand-mint/50 focus:border-brand-mint outline-none transition-all pb-2 placeholder-gray-300"
                    placeholder="Enter a magical title..."
                />
            </div>

            {/* Content Input */}
            <div className="group relative">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">The Tale</label>
                <div className="relative">
                    <textarea 
                        value={story.storyContent} 
                        onChange={handleContentChange}
                        className="w-full h-[500px] p-8 rounded-[2rem] bg-white/50 border-2 border-transparent focus:border-brand-mint/30 focus:bg-white focus:ring-4 focus:ring-brand-mint/10 text-xl font-serif leading-loose text-gray-800 resize-none outline-none transition-all shadow-inner"
                        placeholder="Once upon a time..."
                    />
                    {/* Decorative Corner */}
                    <div className="absolute bottom-6 right-6 text-brand-mint/20 pointer-events-none">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                    </div>
                </div>
            </div>

            {/* Moral Input */}
            <div className="bg-brand-brightGold/10 p-6 rounded-[2rem] border border-brand-brightGold/20 relative overflow-hidden group hover:bg-brand-brightGold/20 transition-colors">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-brightGold/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <label className="block text-xs font-black text-brand-dark/60 uppercase tracking-widest mb-2 relative z-10">The Lesson (Moral)</label>
                <input 
                    type="text"
                    value={story.moral}
                    onChange={(e) => setStory({...story, moral: e.target.value})}
                    className="w-full bg-transparent font-serif font-bold italic text-brand-dark text-xl border-b border-transparent hover:border-brand-brightGold focus:border-brand-brightGold outline-none relative z-10 placeholder-brand-dark/30"
                    placeholder="What did we learn?"
                />
            </div>

            {/* References Display */}
            <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Inspired By</p>
                <div className="space-y-4">
                    {story.references.map((ref, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <p className="text-lg font-serif text-gray-700 italic">"{ref.text}"</p>
                            <span className="text-xs font-black text-brand-accent bg-brand-accent/5 px-3 py-1 rounded-full whitespace-nowrap">{ref.source}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
