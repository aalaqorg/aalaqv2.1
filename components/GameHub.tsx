import React from 'react';
import Link from 'next/link';

const GAMES = [
    {
        id: 'HUROOF',
        title: 'Huroof',
        description: 'Guess the Quranic Word in 6 tries.',
        icon: '🕌',
        color: 'bg-brand-mint',
        href: '/games/huroof'
    },
    {
        id: 'AYAT_SCRAMBLE',
        title: 'Ayat Scramble',
        description: 'Unscramble beautiful verses to find their meaning.',
        icon: '🧩',
        color: 'bg-brand-brightGold',
        href: '/games/ayat-scramble'
    },
    {
        id: 'LETTER_LADDERS',
        title: 'Letter Ladders',
        description: 'Transform words step-by-step (e.g., DARK → LIGHT).',
        icon: '🪜',
        color: 'bg-brand-lavender',
        href: '/games/letter-ladders'
    },
    {
        id: 'TRAITS_CROSSWORD',
        title: 'Prophet’s Traits',
        description: 'A crossword puzzle about the best of character.',
        icon: '📝',
        color: 'bg-brand-accent',
        href: '/games/traits-crossword'
    },
    {
        id: 'MORAL_MADLIBS',
        title: 'Moral Mad Libs',
        description: 'Create funny stories with a hidden lesson.',
        icon: '🎭',
        color: 'bg-pink-400',
        href: '/games/moral-madlibs'
    },
    {
        id: 'RHYME_TIME',
        title: 'Rhyme Time',
        description: 'Find rhyming words for a poetic challenge.',
        icon: '🎤',
        color: 'bg-blue-400',
        href: '/games/rhyme-time'
    },
    {
        id: 'HIDDEN_HUROOF',
        title: 'Hidden Huroof',
        description: 'Find hidden words in the grid.',
        icon: '🔍',
        color: 'bg-orange-400',
        href: '/games/hidden-huroof'
    }
];

export const GameHub: React.FC = () => {
    return (
        <div className="w-full max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out] px-4">
            <div className="text-center mb-12">
                <h2 className="text-5xl font-serif font-black text-brand-dark mb-4 tracking-tight">The Arcade of Wisdom</h2>
                <p className="text-xl text-gray-600 font-bold">Play, learn, and grow with these interactive challenges.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GAMES.map((game) => (
                    <Link
                        key={game.id}
                        href={game.href}
                        className="group relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 text-left shadow-lg border border-white/60 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${game.color} opacity-20 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>
                        
                        <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                            {game.icon}
                        </div>
                        
                        <h3 className="text-2xl font-black text-brand-dark mb-2">{game.title}</h3>
                        <p className="text-gray-600 font-bold text-sm leading-relaxed">{game.description}</p>
                        
                        <div className="mt-auto pt-6 flex items-center text-brand-dark font-black text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                            Play Now 
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
