import React, { useState, useRef, useEffect } from 'react';
import { Story } from '../types';
import { ArrowLeft, Clock, Calendar, User, Volume2, Loader2, Square, Mic2 } from 'lucide-react';
import { generateStorySpeech } from '../services/geminiService';

interface ReaderProps {
  story: Story;
  onBack: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

const VOICES = ['Fenrir', 'Puck', 'Charon', 'Kore', 'Zephyr'];

export const StoryReader: React.FC<ReaderProps> = ({ story, onBack, onEdit, canEdit }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Fenrir');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleSpeak = async () => {
    if (isSpeaking) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    setIsLoadingSpeech(true);
    try {
      const pcmData = await generateStorySpeech(story.content, selectedVoice);
      
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioCtxRef.current;
      
      // Decode PCM data (16-bit, 24kHz, Mono)
      const input = new Int16Array(pcmData.buffer);
      const audioBuffer = ctx.createBuffer(1, input.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < input.length; i++) {
        channelData[i] = input[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
      
      sourceRef.current = source;
      setIsSpeaking(true);
    } catch (e) {
      console.error(e);
      alert("The spirits are silent. (TTS Error)");
    } finally {
      setIsLoadingSpeech(false);
    }
  };

  const date = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate read time
  const words = story.content.split(/\s+/).length;
  const readTime = Math.ceil(words / 200);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto p-6 md:p-12 pb-32">
      <button 
        onClick={onBack} 
        className="mb-8 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Return
      </button>

      <header className="mb-12 border-b border-zinc-900 pb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {story.tags.map(tag => (
            <span 
              key={tag} 
              className="text-xs font-bold tracking-widest uppercase border border-zinc-800 px-2 py-1 rounded-sm"
              style={{ color: 'var(--accent-color)' }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
          {story.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-zinc-500 font-sans">
          <span className="flex items-center gap-2"><Calendar size={14}/> {date}</span>
          <span className="flex items-center gap-2"><Clock size={14}/> {readTime} min read</span>
          {story.authorName && (
             <span className="flex items-center gap-2 text-zinc-400"><User size={14}/> By {story.authorName}</span>
          )}
          
          <div className="flex-1"></div>

          <div className="flex items-center gap-2">
            {!isSpeaking && !isLoadingSpeech && (
              <div className="relative group">
                <Mic2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"/>
                <select 
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-full pl-8 pr-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-[var(--accent-color)] appearance-none cursor-pointer hover:bg-zinc-800 transition-colors uppercase tracking-wide"
                >
                  {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}

            <button
              onClick={handleSpeak}
              disabled={isLoadingSpeech}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white transition-all text-xs uppercase tracking-wide disabled:opacity-50"
            >
              {isLoadingSpeech ? (
                <Loader2 size={12} className="animate-spin" />
              ) : isSpeaking ? (
                <Square size={12} className="fill-current" />
              ) : (
                <Volume2 size={12} />
              )}
              {isLoadingSpeech ? "Conjuring..." : isSpeaking ? "Stop Voice" : "Listen"}
            </button>
          </div>

          {canEdit && (
            <button 
              onClick={onEdit} 
              className="font-bold tracking-wider uppercase text-xs border px-3 py-1 rounded-full transition-all hover:text-white"
              style={{ color: 'var(--accent-color)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              Edit Entry
            </button>
          )}
        </div>
      </header>

      {story.coverImage && (
        <div className="mb-12 overflow-hidden rounded-sm relative h-64 md:h-96 w-full group">
           <div className="absolute inset-0 bg-gradient-to-t from-void-950 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-700"></div>
           <img src={story.coverImage} alt="Cover" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out" />
        </div>
      )}

      <article className="prose prose-invert prose-lg max-w-none font-serif leading-loose" style={{ color: 'var(--text-color)' }}>
        {story.content.split('\n').map((paragraph, idx) => (
           <p key={idx} className="mb-6">{paragraph}</p>
        ))}
      </article>

      <div className="mt-24 pt-12 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 italic font-serif">The end.</p>
      </div>
    </div>
  );
};