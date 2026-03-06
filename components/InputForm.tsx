import React, { useState } from 'react';
import { GENRES } from '../types';

interface InputFormProps {
  onSubmit: (text: string, genre: string) => void;
  isLoading: boolean;
  initialPrompt?: string;
}

const storyStarters = [
  {
    title: 'The Secret Good Deed',
    prompt: 'I decided to do a secret good deed today, but then...',
    color: 'bg-brand-mint',
    textColor: 'text-brand-dark',
    icon: '🤫'
  },
  {
    title: 'My First Fast',
    prompt: 'It was my very first fast, and my stomach rumbled like a...',
    color: 'bg-brand-brightGold',
    textColor: 'text-brand-dark',
    icon: '🌙'
  },
  {
    title: 'The Ramadan Moon',
    prompt: 'We were looking for the moon when suddenly I saw...',
    color: 'bg-brand-lavender',
    textColor: 'text-white',
    icon: '🔭'
  }
];

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, initialPrompt = '' }) => {
  const [text, setText] = useState(initialPrompt);
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);

  // Update text if initialPrompt changes (e.g. coming from Huroof)
  React.useEffect(() => {
      if (initialPrompt) setText(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text, selectedGenre);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-[fadeInUp_0.6s_ease-out]">
      
      {/* Story Starters Row */}
      <div className="mb-8">
        <p className="text-center text-gray-500 font-bold mb-4 uppercase tracking-widest text-xs">Need an idea? Pick a spark!</p>
        <div className="flex flex-wrap justify-center gap-4">
            {storyStarters.map((starter) => (
                <button
                    key={starter.title}
                    onClick={() => setText(starter.prompt)}
                    className={`${starter.color} ${starter.textColor} px-6 py-3 rounded-2xl font-black shadow-lg hover:scale-110 hover:-rotate-2 active:scale-95 transition-all duration-300 flex items-center gap-2 group`}
                >
                    <span className="text-xl group-hover:animate-bounce">{starter.icon}</span>
                    {starter.title}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-1 border border-white/60 shadow-2xl relative group">
        {/* Magic Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-mint via-brand-brightGold to-brand-lavender rounded-[3rem] opacity-30 group-hover:opacity-60 blur-xl transition-opacity duration-500 animate-mesh"></div>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-12 relative z-10">
            <label htmlFor="story-input" className="block text-brand-dark font-serif font-black text-3xl md:text-4xl mb-4 text-center tracking-tight">
            Magic Story Portal
            </label>
            
            <p className="text-gray-600 text-center mb-8 font-sans font-bold">
            Type your idea below and watch it turn into a tale!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Genre Selector */}
            <div className="flex justify-center mb-6">
                <div className="bg-white/50 p-2 rounded-full border border-white/60 shadow-inner flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">Style:</span>
                    <select 
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="bg-transparent font-bold text-brand-dark text-sm outline-none cursor-pointer hover:text-brand-lavender transition-colors pr-2"
                    >
                        {GENRES.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="relative">
                <textarea
                id="story-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Once upon a time in Ramadan..."
                className="w-full h-48 p-8 rounded-[2rem] bg-white border-2 border-brand-mint/30 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 text-brand-dark placeholder-gray-400 text-xl md:text-2xl transition-all resize-none outline-none font-serif leading-relaxed shadow-inner"
                disabled={isLoading}
                />
                {/* Corner decoration */}
                <div className="absolute bottom-6 right-6 text-brand-brightGold pointer-events-none animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                </div>
            </div>

            <button
                type="submit"
                disabled={!text.trim() || isLoading}
                className={`w-full py-5 rounded-2xl font-black text-xl font-sans tracking-wide shadow-xl transition-all duration-300 transform
                ${!text.trim() || isLoading 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-100' 
                    : 'bg-brand-dark text-white hover:bg-brand-lavender hover:scale-[1.02] hover:rotate-1 active:scale-95 hover:shadow-brand-lavender/40'
                }
                `}
            >
                {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Weaving Magic...
                </span>
                ) : (
                'Create My Story'
                )}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};
