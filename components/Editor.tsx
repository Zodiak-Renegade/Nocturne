import React, { useState } from 'react';
import { Story, GeminiAction, AuthorType } from '../types';
import { generateStoryContent, generateStoryTitle } from '../services/geminiService';
import { Save, Wand2, ArrowLeft, Loader2, RefreshCw, FileText, UploadCloud, Image as ImageIcon } from 'lucide-react';

interface EditorProps {
  initialStory?: Story;
  onSave: (story: Story) => void;
  onCancel: () => void;
  defaultAuthorType: AuthorType;
}

export const Editor: React.FC<EditorProps> = ({ initialStory, onSave, onCancel, defaultAuthorType }) => {
  const [title, setTitle] = useState(initialStory?.title || '');
  const [content, setContent] = useState(initialStory?.content || '');
  const [tags, setTags] = useState(initialStory?.tags.join(', ') || '');
  const [authorName, setAuthorName] = useState(initialStory?.authorName || '');
  const [coverImage, setCoverImage] = useState(initialStory?.coverImage || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<boolean>(false);

  const handleSave = (shouldPublish: boolean) => {
    if (!title.trim() || !content.trim()) {
      alert("The story cannot be empty.");
      return;
    }

    const isGuest = defaultAuthorType === 'GUEST';
    
    // Determine publish status:
    // Guests are ALWAYS false (pending)
    // Owner is determined by which button they clicked (shouldPublish)
    const isPublished = isGuest ? false : shouldPublish;

    const newStory: Story = {
      id: initialStory?.id || crypto.randomUUID(),
      title: title || 'Untitled',
      excerpt: content.substring(0, 100) + '...',
      content,
      createdAt: initialStory?.createdAt || Date.now(),
      updatedAt: Date.now(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublished: isPublished,
      coverImage: coverImage.trim() ? coverImage.trim() : (initialStory?.coverImage || `https://picsum.photos/seed/${Date.now()}/800/600?grayscale`),
      authorType: initialStory?.authorType || defaultAuthorType,
      authorName: authorName || (defaultAuthorType === 'OWNER' ? 'The Curator' : 'Anonymous')
    };
    
    onSave(newStory);

    if (isGuest && !initialStory) {
      alert("Your tale has been whispered to the void. The Curator will review it before it manifests in the realm.");
    }
  };

  const handleAI = async (action: GeminiAction) => {
    setIsGenerating(true);
    try {
      const result = await generateStoryContent(content, action);
      if (action === GeminiAction.CONTINUE) {
        setContent(prev => prev + "\n\n" + result);
      } else if (action === GeminiAction.IMPROVE) {
        setContent(prev => prev + "\n\n--- AI Suggestion ---\n" + result);
      } else {
        setContent(prev => prev + "\n\n--- AI Ideas ---\n" + result);
      }
    } catch (error) {
      alert("The spirits were silent. (API Error)");
    } finally {
      setIsGenerating(false);
      setAiMode(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!content) return;
    setIsGenerating(true);
    const newTitle = await generateStoryTitle(content);
    setTitle(newTitle);
    setIsGenerating(false);
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto animate-fade-in p-4 md:p-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex gap-3">
           <button 
            onClick={() => setAiMode(!aiMode)}
            className={`px-4 py-2 rounded-full border border-purple-900/50 flex items-center gap-2 transition-all ${aiMode ? 'bg-purple-900/30 text-purple-200' : 'text-zinc-400 hover:text-purple-300'}`}
          >
            <Wand2 size={16} />
            <span className="hidden sm:inline text-sm font-medium">Ghost Writer</span>
          </button>
          
          {defaultAuthorType === 'OWNER' ? (
            <>
              <button 
                onClick={() => handleSave(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-full hover:bg-zinc-700 transition-all flex items-center gap-2 border border-zinc-700"
              >
                <FileText size={16} /> Save Draft
              </button>
              <button 
                onClick={() => handleSave(true)}
                className="px-6 py-2 bg-zinc-100 text-zinc-950 font-bold rounded-full hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2"
              >
                <UploadCloud size={16} /> Publish
              </button>
            </>
          ) : (
             <button 
              onClick={() => handleSave(false)}
              className="px-6 py-2 bg-zinc-100 text-zinc-950 font-bold rounded-full hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2"
            >
              <Save size={16} /> Submit
            </button>
          )}

        </div>
      </div>

      {/* AI Panel */}
      {aiMode && (
        <div className="mb-6 p-4 glass-panel rounded-xl border-l-4 border-purple-600 animate-fade-in">
          <h3 className="text-purple-300 text-sm font-bold uppercase tracking-wider mb-3">Invoke the Machine Spirit</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              disabled={isGenerating}
              onClick={() => handleAI(GeminiAction.CONTINUE)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-300 transition-colors disabled:opacity-50"
            >
              Continue Story
            </button>
            <button 
              disabled={isGenerating}
              onClick={() => handleAI(GeminiAction.IMPROVE)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-300 transition-colors disabled:opacity-50"
            >
              Enhance Prose
            </button>
             <button 
              disabled={isGenerating}
              onClick={() => handleAI(GeminiAction.IDEAS)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-300 transition-colors disabled:opacity-50"
            >
              Generate Ideas
            </button>
             <button 
              disabled={isGenerating}
              onClick={handleGenerateTitle}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm text-zinc-300 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw size={12}/> Suggest Title
            </button>
          </div>
          {isGenerating && <div className="mt-3 flex items-center gap-2 text-purple-400 text-sm"><Loader2 className="animate-spin" size={14}/> Communing with the void...</div>}
        </div>
      )}

      {/* Editor Inputs */}
      <div className="flex-1 flex flex-col gap-6">
        <input
          type="text"
          placeholder="Enter Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-4xl md:text-5xl font-serif text-white placeholder-zinc-700 focus:outline-none w-full"
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
            <span className="text-xs uppercase tracking-widest whitespace-nowrap">Tags:</span>
            <input
              type="text"
              placeholder="Horror, Sci-fi..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-transparent text-sm text-zinc-300 focus:outline-none w-full"
            />
          </div>

          <div className="flex-1 flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
            <span className="text-xs uppercase tracking-widest whitespace-nowrap">Cover:</span>
            <input
              type="text"
              placeholder="Image URL (Optional)"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="bg-transparent text-sm text-zinc-300 focus:outline-none w-full"
            />
            {coverImage && (
              <a href={coverImage} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white">
                <ImageIcon size={14} />
              </a>
            )}
          </div>
          
          {/* Only show author name input if it is a GUEST post or if we are editing a GUEST post */}
          {(defaultAuthorType === 'GUEST' || (initialStory && initialStory.authorType === 'GUEST')) && (
             <div className="flex-1 flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
              <span className="text-xs uppercase tracking-widest whitespace-nowrap">Author:</span>
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-transparent text-sm text-zinc-300 focus:outline-none w-full"
              />
            </div>
          )}
        </div>

        <textarea
          placeholder="Start writing your story here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-transparent resize-none focus:outline-none text-lg leading-relaxed font-serif placeholder-zinc-800 min-h-[50vh]"
          style={{ color: 'var(--text-color)' }}
        />
      </div>
    </div>
  );
};