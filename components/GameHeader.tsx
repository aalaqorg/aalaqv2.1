import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface GameHeaderProps {
    title: string;
    gameId: string;
    currentUser: User | null;
    onBack: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ title, gameId, currentUser, onBack }) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState<User[]>([]);

    useEffect(() => {
        if (showLeaderboard) {
            setLeaderboard(storageService.getGameLeaderboard(gameId));
        }
    }, [showLeaderboard, gameId]);

    const gamesPlayed = currentUser?.gamesPlayed?.[gameId] || 0;

    return (
        <>
            <div className="w-full flex justify-between items-center mb-4">
                <button onClick={onBack} className="text-gray-500 hover:text-brand-dark transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="text-3xl md:text-4xl font-serif font-black text-brand-dark tracking-tight text-center">{title}</h1>
                <button 
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className={`p-2 rounded-full transition-colors ${showLeaderboard ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Leaderboard"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>
            </div>

            {/* Stats Bar */}
            {currentUser && (
                <div className="flex gap-4 mb-6 text-xs font-bold text-gray-500 bg-white/50 px-4 py-2 rounded-full border border-white/60 mx-auto w-fit">
                    <span>🏆 {currentUser.rewardPoints || 0} Points</span>
                    <span>🎮 {gamesPlayed} Completed</span>
                </div>
            )}

            {/* Leaderboard Modal/Dropdown */}
            {showLeaderboard && (
                <div className="w-full bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/50 animate-pop-in mb-8">
                    <h2 className="text-2xl font-black text-brand-dark mb-4 text-center">Top Players</h2>
                    <div className="space-y-3">
                        {leaderboard.map((u, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className={`font-black w-6 text-center ${i < 3 ? 'text-brand-brightGold text-xl' : 'text-gray-400'}`}>#{i+1}</span>
                                    <span className="font-bold text-gray-700">{u.username}</span>
                                </div>
                                <span className="font-mono font-bold text-brand-mint">{u.gamesPlayed?.[gameId] || 0}</span>
                            </div>
                        ))}
                        {leaderboard.length === 0 && <p className="text-center text-gray-400">No records yet.</p>}
                    </div>
                </div>
            )}
        </>
    );
};
