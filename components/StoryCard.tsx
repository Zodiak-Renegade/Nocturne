import React from 'react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onClick: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  return (
    <div 
      onClick={() => onClick(story)}
      className="group relative bg-void-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-500 cursor-pointer overflow-hidden rounded-sm flex flex-col h-full"
    >
      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-purple-900/0 via-transparent to-[var(--accent-color)] opacity-0 group-hover:opacity-10 transition-all duration-500"
        style={{ '--tw-gradient-to': 'var(--accent-color)' } as React.CSSProperties}
      ></div>

      <div className="relative h-48 overflow-hidden">
         <div className="absolute inset-0 bg-void-900/40 z-10 group-hover:bg-void-900/20 transition-all"></div>
         
         {/* Draft/Pending Badge */}
         {!story.isPublished && (
           <div className="absolute top-2 left-2 z-30 bg-amber-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest shadow-lg border border-amber-600/50">
             {story.authorType === 'OWNER' ? 'Draft' : 'Pending'}
           </div>
         )}

         <img 
          src={story.coverImage || `https://picsum.photos/seed/${story.id}/800/400?grayscale`} 
          alt={story.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col relative z-20">
        <div className="flex gap-2 mb-3">
          {story.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-widest text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-serif font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors">
          {story.title}
        </h3>
        
        <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3 font-serif flex-1">
          {story.excerpt}
        </p>

        <div 
          className="text-xs text-zinc-600 uppercase tracking-widest font-semibold transition-colors mt-auto"
          style={{ color: 'var(--text-color)' }}
        >
          <span className="group-hover:text-[var(--accent-color)] transition-colors">Read Story &rarr;</span>
        </div>
      </div>
    </div>
  );
};