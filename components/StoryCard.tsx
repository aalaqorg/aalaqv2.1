import React, { useState, useEffect } from 'react';
import { PublishedStory, StoryResponse, User } from '../types';
import { storageService } from '../services/storageService';

interface StoryCardProps {
  story: StoryResponse | PublishedStory;
  isPreview?: boolean; // If true, hide voting/author (for just generated ones)
  onVote?: (id: string) => void;
  onReadMoreAuthTrigger?: () => void;
  onMessageAuthor?: (author: string) => void;
  onRemix?: (story: PublishedStory) => void;
  onOpenStory?: (story: PublishedStory) => void;
  currentUser?: User | null;
}

export const StoryCard: React.FC<StoryCardProps> = ({ 
    story, 
    isPreview = false, 
    onVote,
    onReadMoreAuthTrigger,
    onMessageAuthor,
    onRemix,
    onOpenStory,
    currentUser
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [authorRank, setAuthorRank] = useState<{rank: number, badge: string} | null>(null);
  const [specialistGenre, setSpecialistGenre] = useState<string | null>(null);
  
  // Type guard
  const isPublished = (s: any): s is PublishedStory => {
    return (s as PublishedStory).votes !== undefined;
  };

  useEffect(() => {
    if (isPublished(story)) {
        setAuthorRank(storageService.getAuthorRank(story.author));
        
        const stats = storageService.getAuthorGenreStats(story.author);
        const top = Object.entries(stats).sort(([,a], [,b]) => b - a)[0];
        if (top && top[1] >= 2) {
            setSpecialistGenre(top[0]);
        }

        if (currentUser) {
            storageService.getBookmarks(currentUser.username).then(bookmarks => {
                setIsBookmarked(bookmarks.includes(story.id));
            });
            storageService.getUserRating(story.id, currentUser.username).then(setUserRating);
            storageService.hasVoted(story.id, currentUser.username).then(setHasVoted);
        }
    }
  }, [story, currentUser]);
  
  // Truncation Logic
  const content = story.storyContent || '';
  const words = content.split(/\s+/);
  const isLong = words.length > 100;
  const previewText = isLong ? words.slice(0, 100).join(' ') + '...' : content;
  
  const paragraphs = content.split('\n').filter(p => p.trim());
  const remainingParagraphs = paragraphs.slice(1);

  const handleReadMore = () => {
      if (!currentUser && !isPreview) {
          onReadMoreAuthTrigger?.();
      } else {
           // Desktop check (simple width check)
           if (window.innerWidth >= 768 && onOpenStory && isPublished(story)) {
               onOpenStory(story);
           } else {
               setIsExpanded(true);
           }
      }
  };

  const handleBookmark = async () => {
      if (!currentUser) {
          onReadMoreAuthTrigger?.();
          return;
      }
      if (isPublished(story)) {
          await storageService.toggleBookmark(currentUser.username, story.id);
          setIsBookmarked(!isBookmarked);
      }
  };

  const handleRate = async (rating: number) => {
      if (!currentUser) {
          onReadMoreAuthTrigger?.();
          return;
      }
      if (isPublished(story)) {
          await storageService.rateStory(story.id, currentUser.username, rating);
          setUserRating(rating);
      }
  };

  const handleVoteClick = async () => {
      if (!currentUser) {
          onReadMoreAuthTrigger?.();
          return;
      }
      if (isPublished(story) && !hasVoted) {
          await storageService.voteStory(story.id, currentUser.username);
          setHasVoted(true);
          onVote?.(story.id);
      }
  };

  const handleDelete = async () => {
      if (confirm("Are you sure you want to delete this story?")) {
          try {
              await storageService.deleteStory((story as PublishedStory).id);
              window.location.reload(); 
          } catch (e) {
              alert("Failed to delete");
          }
      }
  };

  const isAdmin = currentUser?.email === "aalaq@gmail.com" || currentUser?.username === "Aalaq Admin";

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-lg border border-white/60 overflow-hidden flex flex-col h-full hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group relative">
      {/* 6. The "Aalaq" Blend: Geometric Arabesque Pattern */}
      <div className="absolute inset-0 bg-arabesque opacity-5 pointer-events-none z-0"></div>

      {/* Header */}
      <div className="p-10 pb-4 relative z-10">
        {isAdmin && isPublished(story) && (
            <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md z-50 hover:scale-110 transition-transform"
                title="Admin Delete"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        )}
        <div className="flex flex-col gap-4">
            {/* Genre Badge */}
            {isPublished(story) && story.genre && (
                <span className="self-start px-4 py-1.5 rounded-full bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-sm">
                    {story.genre}
                </span>
            )}
            
            {/* Title & Bookmark Row */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h2 className="text-3xl font-serif font-black text-brand-dark leading-tight group-hover:text-brand-lavender transition-colors">
                        {story.title}
                    </h2>
                    {isPublished(story) && story.remixedFrom && (
                        <span className="text-[10px] text-gray-400 font-bold italic block mt-1">
                            Remixed Story
                        </span>
                    )}
                </div>
                
                {/* Bookmark / Favorite Button */}
                <button 
                    onClick={handleBookmark}
                    className={`p-3 rounded-full transition-all hover:scale-110 shadow-sm border border-white/50 ${
                        isBookmarked 
                        ? 'bg-brand-accent text-white' 
                        : 'bg-white/80 text-gray-400 hover:text-brand-accent'
                    }`}
                    title="Add to Favorites"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
        </div>
        
        {isPublished(story) && (
            <div className="flex flex-col gap-4 mt-6">
                {/* Author Row */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-sm font-black text-brand-brightGold shadow-md relative">
                            {story.author.substring(0, 2).toUpperCase()}
                            {/* Author Rank Badge */}
                            {authorRank && authorRank.badge && (
                                <div className="absolute -top-2 -right-2 bg-brand-accent text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-white z-10">
                                    {authorRank.badge}
                                </div>
                            )}
                            {/* Specialist Badge */}
                            {specialistGenre && (
                                <div className="absolute -bottom-2 -right-2 bg-brand-lavender text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-white whitespace-nowrap z-10">
                                    {specialistGenre} Pro
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-brand-dark flex items-center gap-2">
                                {story.author}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{new Date(story.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Message & Rating */}
                    <div className="flex items-center gap-3">
                        {currentUser && currentUser.username !== story.author && (
                            <button 
                                onClick={() => onMessageAuthor?.(story.author)}
                                className="p-2 text-gray-400 hover:text-brand-dark hover:bg-white rounded-full transition-all hover:scale-110 hover:shadow-md"
                                title="Message Author"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </button>
                        )}
                        
                        {/* Star Rating */}
                        <div className="flex gap-0.5 bg-white/50 px-2 py-1 rounded-full border border-white/40">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    className={`w-3 h-3 ${star <= (userRating || (story.ratingCount > 0 ? Math.round(story.ratingSum / story.ratingCount) : 0)) ? 'text-brand-brightGold fill-current' : 'text-gray-300'}`}
                                >
                                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Vote Count (Public) */}
                <div className="flex justify-end">
                     {onVote && (
                        <button 
                            onClick={handleVoteClick}
                            disabled={hasVoted}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition-all ${
                                hasVoted 
                                ? 'bg-brand-mint/20 text-brand-dark cursor-default' 
                                : 'bg-gray-100 text-gray-500 hover:bg-brand-mint hover:text-white'
                            }`}
                            title="Public Upvote"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {story.votes}
                        </button>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Content */}
      <div className="px-10 py-6 flex-grow relative z-10">
        <div className="prose prose-lg prose-slate font-serif text-gray-700 leading-relaxed">
           {isExpanded ? (
               <>
                <p className="first-letter:text-5xl first-letter:font-black first-letter:text-brand-dark first-letter:mr-3 first-letter:float-left">
                    {paragraphs[0]}
                </p>
                {remainingParagraphs.map((p, i) => (
                    <p key={i} className="animate-[fadeIn_0.5s_ease-out]">{p}</p>
                ))}
               </>
           ) : (
               <p className="first-letter:text-5xl first-letter:font-black first-letter:text-brand-dark first-letter:mr-3 first-letter:float-left">
                   {previewText}
               </p>
           )}
        </div>
        
        {isExpanded && story.references && story.references.length > 0 && (
            <div className="mt-8 pt-8 border-t border-brand-dark/10 animate-[fadeIn_0.5s_ease-out]">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Inspiration from the Source</h4>
                <div className="space-y-4">
                    {story.references.map((ref, idx) => (
                        <div key={idx} className="bg-brand-mint/10 p-4 rounded-2xl border border-brand-mint/20">
                            <p className="text-lg font-serif italic text-brand-dark mb-2">"{ref.text}"</p>
                            <p className="text-xs font-bold text-brand-dark/60 text-right">— {ref.source}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        <div className="flex flex-wrap gap-4 mt-8">
            {!isExpanded && (isLong || !isPreview) && (
                 <button 
                    onClick={handleReadMore}
                    className="px-6 py-3 bg-brand-dark text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-lavender hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2 group/btn w-fit animate-pop-in"
                 >
                    Read Full Story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                 </button>
            )}

            {/* Remix Button */}
            {isPublished(story) && onRemix && (
                <button 
                    onClick={() => onRemix(story)}
                    className="px-6 py-3 bg-white text-brand-dark border-2 border-brand-dark rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-dark hover:text-white hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2 group/btn w-fit animate-pop-in"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Remix
                </button>
            )}
        </div>
      </div>

      {/* Footer / Moral */}
      <div className="bg-brand-dark/5 p-8 relative overflow-hidden mt-auto border-t border-black/5">
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-black">The Lesson</div>
            <div className="text-brand-dark text-lg font-serif font-bold italic">"{story.moral}"</div>
          </div>
      </div>
    </div>
  );
};
