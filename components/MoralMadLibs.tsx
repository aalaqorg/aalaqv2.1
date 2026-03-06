import React, { useState, useEffect } from 'react';
import { GameHeader } from './GameHeader';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Loader2, HelpCircle } from 'lucide-react';

interface MoralMadLibsProps {
    onBack: () => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
}

interface MadLibData {
    story: string;
    inputs: string[];
}

export const MoralMadLibs: React.FC<MoralMadLibsProps> = ({ onBack, currentUser, onUpdateUser }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [inputs, setInputs] = useState<string[]>(['', '', '', '']);
    const [showStory, setShowStory] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<MadLibData | null>(null);
    const [showHint, setShowHint] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNewTemplate();
    }, [currentLevel]);

    const loadNewTemplate = async () => {
        setIsLoading(true);
        setError(null);
        setShowStory(false);
        setInputs(['', '', '', '']);
        setShowHint(false);
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameType: 'MORAL_MADLIBS' })
            });
            if (!response.ok) throw new Error("Failed to connect");
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            if (!data.story || !data.inputs) throw new Error("Invalid mad lib data");

            setGameData(data);
            if (data.inputs) {
                setInputs(new Array(data.inputs.length).fill(''));
            }
        } catch (err: any) {
            console.error("Failed to load mad lib:", err);
            setError(err.message || "Failed to load story template");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (index: number, val: string) => {
        const newInputs = [...inputs];
        newInputs[index] = val;
        setInputs(newInputs);
    };

    const generateStory = () => {
        setShowStory(true);
        if (currentUser) {
            storageService.incrementGameStat(currentUser.username, 'MORAL_MADLIBS');
            const updated = storageService.getUser(currentUser.username);
            if (updated) onUpdateUser(updated);
        }
    };

    const giveHint = () => {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
    };

    const nextStory = () => {
        setCurrentLevel(prev => prev + 1);
    };

    const getStoryText = () => {
        if (!gameData) return "";
        let text = gameData.story;
        inputs.forEach((val, i) => {
            text = text.replace(`{${i}}`, `<span class="text-brand-mint font-black">${val || '___'}</span>`);
        });
        return text;
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-mint animate-spin mb-4" />
                <p className="text-brand-dark font-bold animate-pulse">AI is writing a new story template...</p>
            </div>
        );
    }

    if (error || !gameData) {
        return (
             <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <p className="text-red-500 font-bold mb-4">{error || "Could not load story."}</p>
                <button onClick={loadNewTemplate} className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:scale-105 transition-transform">Retry</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto animate-[fadeIn_0.5s_ease-out] flex flex-col items-center min-h-[80vh] p-4">
            <GameHeader 
                title="Moral Mad Libs" 
                gameId="MORAL_MADLIBS" 
                currentUser={currentUser} 
                onBack={onBack} 
            />

            <div className="w-full flex justify-between items-center mb-6">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Story {currentLevel + 1}</p>
                <button 
                    onClick={giveHint}
                    className="p-3 bg-white border-2 border-pink-400 text-pink-400 rounded-2xl hover:bg-pink-400 hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
                >
                    <HelpCircle className="w-5 h-5" />
                    <span>Hint</span>
                </button>
            </div>

            {showHint && (
                <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-xl text-pink-600 font-bold text-sm animate-bounce text-center">
                    Hint: Think of the funniest or most creative words you can!
                </div>
            )}

            {!showStory ? (
                <div className="w-full space-y-6">
                    <p className="text-center text-gray-500 font-bold mb-4">Fill in the blanks to create a unique AI story!</p>
                    {gameData?.inputs.map((label, i) => (
                        <div key={i} className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">{label}</label>
                            <input 
                                type="text" 
                                value={inputs[i]}
                                onChange={(e) => handleInputChange(i, e.target.value)}
                                className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-100 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/10 outline-none font-bold text-brand-dark transition-all"
                                placeholder={`Enter a ${label.toLowerCase()}...`}
                            />
                        </div>
                    ))}
                    <button 
                        onClick={generateStory}
                        disabled={inputs.some(i => !i.trim())}
                        className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                        Create AI Story
                    </button>
                </div>
            ) : (
                <div className="w-full text-center animate-pop-in">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 mb-8">
                        <p 
                            className="text-2xl font-serif font-bold text-brand-dark leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: getStoryText() }}
                        />
                    </div>
                    <button 
                        onClick={nextStory}
                        className="px-8 py-3 bg-brand-brightGold text-brand-dark rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                    >
                        Generate New Template
                    </button>
                </div>
            )}
        </div>
    );
};