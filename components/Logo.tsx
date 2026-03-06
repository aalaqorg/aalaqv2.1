import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 select-none">
        {/* Logo Icon - Black Lantern/Leaf Shape */}
        <div className="w-10 h-10 text-brand-dark">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-sm">
                <path d="M12 1.5C15.5 6.5 21 9.5 21 12C21 14.5 15.5 17.5 12 22.5C8.5 17.5 3 14.5 3 12C3 9.5 8.5 6.5 12 1.5Z" />
            </svg>
        </div>
        
        <span className="text-4xl font-serif font-bold text-brand-dark tracking-tight">
            StoryBookAi
        </span>
    </div>
  );
};
