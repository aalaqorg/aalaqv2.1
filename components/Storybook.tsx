import React, { useEffect, useState } from 'react';
import { PublishedStory, User, GENRES } from '../types';
import { storageService } from '../services/storageService';
import { StoryCard } from './StoryCard';

interface StorybookProps {
    currentUser: User | null;
    onReadMoreAuthTrigger: () => void;
    onMessageAuthor: (author: string) => void;
    onRemix: (story: PublishedStory) => void;
    onOpenStory: (story: PublishedStory) => void;
}

const TopAuthorsView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [topAuthors, setTopAuthors] = useState<[string, number][]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopAuthors = async () => {
            const favStories = await storageService.getBookmarkedStories(currentUser.username);
            const authorCounts: Record<string, number> = {};
            favStories.forEach(s => {
                authorCounts[s.author] = (authorCounts[s.author] || 0) + 1;
            });
            const sortedAuthors = Object.entries(authorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            setTopAuthors(sortedAuthors);
            setLoading(false);
        };
        fetchTopAuthors();
    }, [currentUser]);

    if (loading) return <div className="text-center text-xs font-bold text-gray-400">Loading favorites...</div>;

    if (topAuthors.length === 0) return <p className="text-gray-400 italic text-sm text-center">Bookmark stories to see your favorite authors here.</p>;

    return (
        <div className="mb-12 animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">Your Favorite Storytellers</h3>
            <div className="flex flex-wrap justify-center gap-6">
                {topAuthors.map(([author, count]) => (
                    <div key={author} className="bg-white/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-xs font-black text-brand-brightGold">
                            {author.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-brand-dark text-sm">{author}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{count} stories saved</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Storybook: React.FC<StorybookProps> = ({ currentUser, onReadMoreAuthTrigger, onMessageAuthor, onRemix, onOpenStory }) => {
  const [stories, setStories] = useState<PublishedStory[]>([]);
  const [filter, setFilter] = useState<'NEW' | 'TOP'>('NEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string | 'ALL'>('ALL');
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadStories();
  }, [filter, searchQuery, activeGenre, showFavorites, currentUser]);

  const loadStories = async () => {
    let loaded = showFavorites && currentUser 
        ? await storageService.getBookmarkedStories(currentUser.username)
        : await storageService.getStories();

    // Filter by Search
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        loaded = loaded.filter(s => 
            s.title.toLowerCase().includes(q) || 
            s.author.toLowerCase().includes(q) ||
            s.storyContent.toLowerCase().includes(q) ||
            (s.genre && s.genre.toLowerCase().includes(q))
        );
    }

    // Filter by Genre
    if (activeGenre !== 'ALL') {
        loaded = loaded.filter(s => s.genre === activeGenre);
    }

    // Sort
    if (filter === 'TOP') {
        loaded = loaded.sort((a, b) => b.votes - a.votes);
    } else {
        loaded = loaded.sort((a, b) => b.timestamp - a.timestamp);
    }
    setStories(loaded);
  };

  const handleVote = async (id: string) => {
    await storageService.voteStory(id);
    // Re-apply filters locally to avoid full reload flicker or just reload
    loadStories(); 
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center mb-12">
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8 relative">
                <input 
                    type="text" 
                    placeholder="Search stories, authors, or wisdom..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 rounded-full border-2 border-brand-mint/30 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none text-lg font-bold text-brand-dark shadow-sm pl-12"
                />
                <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
                {/* Sort Toggle */}
                <div className="flex bg-white/30 backdrop-blur-md p-1.5 rounded-full border border-white/40 shadow-sm">
                    <button 
                        onClick={() => setFilter('NEW')}
                        className={`px-5 py-2 rounded-full text-xs font-black transition-all ${filter === 'NEW' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-600 hover:bg-white/50'}`}
                    >
                        Newest
                    </button>
                    <button 
                        onClick={() => setFilter('TOP')}
                        className={`px-5 py-2 rounded-full text-xs font-black transition-all ${filter === 'TOP' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-600 hover:bg-white/50'}`}
                    >
                        Top Rated
                    </button>
                </div>

                {/* Favorites Toggle */}
                {currentUser && (
                    <button 
                        onClick={() => setShowFavorites(!showFavorites)}
                        className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 border ${
                            showFavorites 
                            ? 'bg-brand-accent text-white border-brand-accent shadow-md' 
                            : 'bg-white/30 text-gray-600 border-white/40 hover:bg-white/50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill={showFavorites ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        My Favorites
                    </button>
                )}
            </div>

            {/* Genre Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
                <button 
                    onClick={() => setActiveGenre('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                        activeGenre === 'ALL' 
                        ? 'bg-brand-dark border-brand-dark text-white shadow-md' 
                        : 'bg-black/20 border-white/20 text-white hover:bg-black/30 hover:border-white/40 backdrop-blur-sm'
                    }`}
                >
                    All
                </button>
                {GENRES.map(genre => (
                    <button 
                        key={genre}
                        onClick={() => setActiveGenre(genre)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                            activeGenre === genre 
                            ? 'bg-brand-dark border-brand-dark text-white shadow-md' 
                            : 'bg-black/20 border-white/20 text-white hover:bg-black/30 hover:border-white/40 backdrop-blur-sm'
                        }`}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </div>

        {/* Favorites View: Top Authors */}
        {showFavorites && currentUser && (
            <TopAuthorsView currentUser={currentUser} />
        )}

        {stories.length === 0 ? (
            <div className="text-center text-gray-500 py-32 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-sm">
                <p className="text-2xl font-serif font-bold">
                    {searchQuery ? "No stories found matching your search." : "No stories yet. Be the first to write one!"}
                </p>
            </div>
        ) : (
            /* Bento Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[minmax(400px,auto)]">
                {stories.map((story, index) => {
                    // Simple logic to vary sizes for Bento effect
                    // Every 4th item spans 2 columns if on large screen
                    const isWide = index % 4 === 0 || index === 0;
                    const colSpan = isWide ? 'lg:col-span-2' : 'lg:col-span-1';
                    
                    return (
                        <div key={story.id} className={`h-full ${colSpan}`}>
                            <StoryCard 
                                story={story} 
                                onVote={handleVote} 
                                currentUser={currentUser}
                                onReadMoreAuthTrigger={onReadMoreAuthTrigger}
                                onMessageAuthor={onMessageAuthor}
                                onRemix={onRemix}
                                onOpenStory={onOpenStory}
                            />
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};