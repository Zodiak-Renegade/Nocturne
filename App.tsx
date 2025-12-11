import React, { useState, useEffect } from 'react';
import { ViewState, Story } from './types';
import { 
  getStories, saveStory, seedInitialData, deleteStory, 
  getPasscode, savePasscode, verifyPasscode,
  getHeroSubtitle, saveHeroSubtitle, 
  getBackgroundImage, saveBackgroundImage, 
  getThemeSettings, saveThemeSettings, ThemeSettings, 
  getBalance, addToBalance, withdrawBalance, 
  getLinkedCard, saveLinkedCard,
  getFounderProfile, saveFounderProfile, FounderProfile
} from './services/storageService';
import { StoryCard } from './components/StoryCard';
import { Editor } from './components/Editor';
import { StoryReader } from './components/StoryReader';
import { 
  PenTool, BookOpen, Ghost, Menu, X, Plus, Users, Lock, Unlock, 
  Trash2, Settings, Check, AlertCircle, Type, Image as ImageIcon, 
  Palette, Heart, CreditCard, DollarSign, Wallet, User, LayoutDashboard,
  FileText
} from 'lucide-react';

// Animation Interface
interface FallingItem {
  id: number;
  left: string;
  delay: string;
  emoji: string;
  type: 'cat' | 'heart';
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [password, setPassword] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  
  // Customization State
  const [subtitle, setSubtitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [newBgInput, setNewBgInput] = useState('');
  const [theme, setTheme] = useState<ThemeSettings>({ accentColor: '#8a0000', textColor: '#e0e0e0' });

  // Founder Profile State
  const [founderProfile, setFounderProfile] = useState<FounderProfile>({ name: '', tagline: '', bio: '', imageUrl: '' });
  const [settingsTab, setSettingsTab] = useState<'dashboard' | 'founder'>('dashboard');

  // Treasury State
  const [balance, setBalance] = useState(0);
  const [linkedCard, setLinkedCard] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  
  // Donation Form State
  const [donationAmount, setDonationAmount] = useState<number | ''>('');
  const [isProcessingDonation, setIsProcessingDonation] = useState(false);

  // Fun Animation State
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);

  useEffect(() => {
    seedInitialData();
    refreshStories();
    setSubtitle(getHeroSubtitle());
    setBgImage(getBackgroundImage());
    setTheme(getThemeSettings());
    setFounderProfile(getFounderProfile());
    refreshTreasury();
  }, []);

  const refreshStories = () => {
    setStories(getStories());
  };

  const refreshTreasury = () => {
    setBalance(getBalance());
    setLinkedCard(getLinkedCard());
  };

  const triggerCats = () => {
    // Generate 15 cats with random positions (Login effect)
    const items: FallingItem[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90}%`,
      delay: `${Math.random() * 0.5}s`,
      emoji: '🐈‍⬛',
      type: 'cat'
    }));
    setFallingItems(items);
    
    // Remove them after animation completes
    setTimeout(() => {
      setFallingItems([]);
    }, 2500);
  };

  const triggerCelebration = () => {
    // Generate mixture of cats and hearts (Donation effect)
    const items: FallingItem[] = Array.from({ length: 40 }).map((_, i) => {
      const isCat = Math.random() > 0.5;
      return {
        id: i,
        left: `${Math.random() * 95}%`,
        delay: `${Math.random() * 2}s`,
        emoji: isCat ? '🐈‍⬛' : '❤️',
        type: isCat ? 'cat' : 'heart'
      };
    });
    setFallingItems(items);
    
    setTimeout(() => {
      setFallingItems([]);
    }, 5000);
  };

  const handleCreateNew = () => {
    setActiveStory(undefined);
    setView('CREATE');
    setMobileMenuOpen(false);
  };

  const handleSaveStory = (story: Story) => {
    saveStory(story);
    refreshStories();
    if (story.isPublished) {
      setActiveStory(story);
      setView('READ');
    } else {
      // If it's a draft or pending story, go back to appropriate list
      if (story.authorType === 'OWNER') {
          setView('HOME'); 
      } else {
          setView('COMMUNITY');
      }
    }
  };

  const handleDeleteStory = (id: string) => {
    if (confirm("Are you sure you want to cast this story into the void forever?")) {
      deleteStory(id);
      refreshStories();
      setView('HOME');
    }
  };

  const handleApproveStory = (story: Story) => {
    const updatedStory = { ...story, isPublished: true };
    saveStory(updatedStory);
    refreshStories();
  };

  const handleRejectStory = (id: string) => {
    if (confirm("Reject and delete this submission?")) {
      deleteStory(id);
      refreshStories();
    }
  };

  const handleReadStory = (story: Story) => {
    setActiveStory(story);
    setView('READ');
  };

  const handleEditStory = () => {
    if (!activeStory) return;
    if (!isOwner && activeStory.authorType === 'OWNER') return;
    
    setView('EDIT');
  };

  const toggleLogin = () => {
    if (isOwner) {
      setIsOwner(false);
    } else {
      setShowLogin(true);
    }
    setMobileMenuOpen(false);
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyPasscode(password);
    if (isValid) {
      setIsOwner(true);
      setShowLogin(false);
      setPassword('');
      triggerCats(); // MEOW!
    } else {
      alert("Access denied.");
    }
  }

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim().length > 0) {
      await savePasscode(newPasscode);
      setNewPasscode('');
      alert("Passcode updated successfully.");
    }
  }

  const handleSaveSubtitle = () => {
    if (newSubtitle.trim()) {
      saveHeroSubtitle(newSubtitle);
      setSubtitle(newSubtitle);
      alert("Chronicle subtitle updated.");
    }
  }

  const handleSaveBg = () => {
    if (newBgInput.trim()) {
        saveBackgroundImage(newBgInput);
        setBgImage(newBgInput);
        alert("Live background updated.");
    }
  }

  const handleSaveTheme = () => {
    saveThemeSettings(theme);
    alert("Theme colors updated.");
  }

  const handleSaveFounder = () => {
    saveFounderProfile(founderProfile);
    alert("Founder profile updated.");
  }

  // --- Treasury Logic ---
  const handleLinkCard = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate linking card by just saving last 4 digits
    if (newCardNumber.length >= 4) {
      const last4 = newCardNumber.slice(-4);
      saveLinkedCard(last4);
      setLinkedCard(last4);
      setNewCardNumber('');
      alert(`Card ending in ${last4} linked successfully.`);
    } else {
      alert("Please enter a valid card number.");
    }
  }

  const handleWithdraw = () => {
    if (!linkedCard) return;
    if (balance <= 0) return;
    
    if (confirm(`Withdraw $${balance.toFixed(2)} to card ending in ${linkedCard}?`)) {
      withdrawBalance();
      refreshTreasury();
      alert("Funds withdrawn successfully. The transfer has begun.");
    }
  }

  const handleProcessDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationAmount || Number(donationAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    
    setIsProcessingDonation(true);
    
    // Simulate processing delay
    setTimeout(() => {
      addToBalance(Number(donationAmount));
      refreshTreasury();
      setIsProcessingDonation(false);
      setDonationAmount('');
      triggerCelebration();
      alert("Your offering has been accepted. The Curator thanks you.");
      setView('HOME');
    }, 1500);
  }

  // --- Filtered Stories ---
  const publishedOwnerStories = stories.filter(s => s.authorType === 'OWNER' && s.isPublished);
  const draftOwnerStories = stories.filter(s => s.authorType === 'OWNER' && !s.isPublished);

  const communityStories = stories.filter(s => s.authorType === 'GUEST' && s.isPublished);
  const pendingStories = stories.filter(s => s.authorType === 'GUEST' && !s.isPublished);

  // Check if background is video
  const isVideoBg = bgImage.match(/\.(mp4|webm)$/i);

  // --- Views ---

  const renderHome = () => (
    <div className="animate-fade-in p-6 md:p-12 max-w-7xl mx-auto relative z-10">
      <header className="mb-16 md:mb-24 text-center md:text-left">
        <h1 className="text-5xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-6 drop-shadow-lg tracking-tight">
          Nocturne Weave
        </h1>
        <p className="text-lg md:text-xl font-light max-w-2xl leading-relaxed whitespace-pre-wrap opacity-90" style={{ color: 'var(--text-color)' }}>
          {subtitle}
        </p>
      </header>
      
      {/* Admin Drafts Section */}
      {isOwner && draftOwnerStories.length > 0 && (
        <div className="mb-16 border-b border-zinc-900/50 pb-8 animate-fade-in">
           <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600 flex items-center gap-2 mb-6">
             <FileText size={14}/> Unpublished Drafts
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {draftOwnerStories.map(story => (
                <div key={story.id} className="relative group opacity-80 hover:opacity-100 transition-opacity">
                  <StoryCard story={story} onClick={handleReadStory} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                    className="absolute top-2 right-2 p-2 bg-red-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
             ))}
           </div>
        </div>
      )}

      {/* Main Published Entries */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
          <BookOpen size={14}/> Latest Entries
        </h2>
        {isOwner && (
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-full hover:bg-zinc-900 transition-colors text-xs uppercase tracking-wide text-zinc-300"
          >
            <Plus size={14} /> New Chronicle
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {publishedOwnerStories.length === 0 && !isOwner && (
          <div className="col-span-full text-center py-20 text-zinc-600 italic">
             The archives are silent...
           </div>
        )}
        {publishedOwnerStories.map(story => (
           <div key={story.id} className="relative group">
              <StoryCard story={story} onClick={handleReadStory} />
              {isOwner && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                  className="absolute top-2 right-2 p-2 bg-red-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30"
                >
                  <Trash2 size={14}/>
                </button>
              )}
           </div>
        ))}
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="animate-fade-in p-6 md:p-12 max-w-7xl mx-auto relative z-10">
      <header className="mb-16 md:mb-24 text-center md:text-left">
        <h1 className="text-4xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-mystic-300 to-zinc-800 mb-6 drop-shadow-lg tracking-tight">
          Whispers
        </h1>
        <p className="text-lg md:text-xl font-light max-w-2xl leading-relaxed opacity-90" style={{ color: 'var(--text-color)' }}>
          Voices from the void. Stories submitted by the lost souls of the community.
        </p>
      </header>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
          <Users size={14}/> Community Tales
        </h2>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 border rounded-full transition-colors text-xs uppercase tracking-wide font-bold"
          style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
        >
          <PenTool size={14} /> Submit a Tale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {communityStories.length === 0 ? (
           <div className="col-span-full text-center py-20 text-zinc-600 italic">
             No whispers yet. Be the first to speak...
           </div>
        ) : (
          communityStories.map(story => (
            <div key={story.id} className="relative group">
              <StoryCard story={story} onClick={handleReadStory} />
              {isOwner && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                  className="absolute top-2 right-2 p-2 bg-red-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30"
                >
                  <Trash2 size={14}/>
                </button>
              )}
           </div>
          ))
        )}
      </div>
    </div>
  );

  const renderDonate = () => (
    <div className="animate-fade-in p-6 md:p-12 max-w-3xl mx-auto relative z-10 min-h-[80vh] flex flex-col justify-center">
       <header className="mb-12 text-center">
        <Heart className="w-16 h-16 mx-auto mb-6 opacity-80 animate-pulse-slow" style={{ color: 'var(--accent-color)' }} />
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-4 tracking-tight">
          Offer Support
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto font-light">
          Your offerings help keep the lanterns lit and the ink flowing. The Curator is grateful for your tribute.
        </p>
      </header>

      <div className="bg-void-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl shadow-2xl">
         <form onSubmit={handleProcessDonation} className="space-y-8">
            {/* Amount Selection */}
            <div>
               <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Select Tribute</label>
               <div className="grid grid-cols-3 gap-4 mb-4">
                 {[5, 10, 20].map(amount => (
                   <button 
                     key={amount}
                     type="button"
                     onClick={() => setDonationAmount(amount)}
                     className={`py-3 rounded-lg border text-lg font-serif transition-all ${donationAmount === amount ? 'bg-[var(--accent-color)] text-white border-transparent' : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                   >
                     ${amount}
                   </button>
                 ))}
               </div>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-serif text-lg">$</span>
                 <input 
                  type="number" 
                  placeholder="Custom Amount" 
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[var(--accent-color)] outline-none transition-colors font-serif"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                 />
               </div>
            </div>

            {/* Simulated Card Info */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">Payment Method</label>
              <div className="bg-black/40 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 mb-2 border-b border-zinc-800 pb-2">
                  <CreditCard size={16} /> <span className="text-xs uppercase">Debit / Credit Card</span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-green-500 border border-green-900 px-2 py-0.5 rounded-full bg-green-950/30">
                    <Lock size={8}/> 256-bit Encrypted
                  </span>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Cardholder Name" 
                  className="w-full bg-transparent border-b border-zinc-800 py-2 text-white focus:border-[var(--accent-color)] outline-none text-sm transition-colors"
                />
                
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                  maxLength={19}
                  className="w-full bg-transparent border-b border-zinc-800 py-2 text-white focus:border-[var(--accent-color)] outline-none text-sm transition-colors tracking-widest"
                />
                
                <div className="flex gap-4">
                   <input 
                    type="text" 
                    placeholder="MM/YY" 
                    maxLength={5}
                    className="w-full bg-transparent border-b border-zinc-800 py-2 text-white focus:border-[var(--accent-color)] outline-none text-sm transition-colors text-center"
                  />
                  <input 
                    type="password" 
                    placeholder="CVC" 
                    maxLength={3}
                    className="w-full bg-transparent border-b border-zinc-800 py-2 text-white focus:border-[var(--accent-color)] outline-none text-sm transition-colors text-center"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessingDonation}
              className="w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
            >
              {isProcessingDonation ? 'Processing Offering...' : 'Leave Offering'}
            </button>
         </form>
         <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-wide">
           Secure Transaction • Nocturne Weave Treasury
         </p>
      </div>
    </div>
  );

  const renderFounder = () => (
    <div className="animate-fade-in p-6 md:p-12 max-w-6xl mx-auto relative z-10 min-h-screen flex items-center">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        {/* Founder Image */}
        <div className="w-full md:w-1/2">
           <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-zinc-800/50 group">
             <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent z-10"></div>
             <img 
              src={founderProfile.imageUrl} 
              alt={founderProfile.name}
              className="w-full h-full object-cover grayscale brightness-90 contrast-125 group-hover:scale-105 transition-transform duration-1000 ease-out"
             />
             <div className="absolute bottom-6 left-6 z-20">
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">{founderProfile.name}</h2>
               <p className="text-zinc-400 font-serif italic" style={{ color: 'var(--accent-color)' }}>{founderProfile.tagline}</p>
             </div>
           </div>
        </div>

        {/* Founder Text */}
        <div className="w-full md:w-1/2">
           <h1 className="text-6xl md:text-8xl font-serif font-bold text-zinc-900 select-none absolute -top-20 -right-10 opacity-50 pointer-events-none md:block hidden">
             ORIGIN
           </h1>
           <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 block mb-8">The Founder</span>
              <div className="prose prose-invert prose-lg">
                <p className="text-xl md:text-2xl font-serif leading-relaxed text-zinc-300 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]" style={{ color: 'var(--text-color)' }}>
                   {founderProfile.bio}
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-zinc-900/50 flex gap-6">
                 {/* Social placeholders or signature could go here */}
                 <div className="h-px bg-gradient-to-r from-[var(--accent-color)] to-transparent w-32"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-void-950 font-sans relative overflow-hidden">
      {/* Inject CSS Variables for Dynamic Theme */}
      <style>{`
        :root {
          --accent-color: ${theme.accentColor};
          --text-color: ${theme.textColor};
        }
        ::selection {
          background-color: var(--accent-color);
          color: #fff;
        }
      `}</style>
      
      {/* 
        --- HIGH END BACKGROUND ENGINE ---
      */}
      
      {/* Layer 0 & 1: Base Media */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-void-950">
         {isVideoBg ? (
           <video 
             src={bgImage} 
             autoPlay 
             loop 
             muted 
             playsInline 
             className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-1000 grayscale"
           />
         ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center animate-ken-burns will-change-transform grayscale opacity-30"
              style={{ backgroundImage: `url(${bgImage})` }}
            ></div>
         )}
         
         {/* Layer 2: Heavy Cinematic Vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.8)_60%,#050505_100%)]"></div>

         {/* Layer 3: Linear Gradient for text readability */}
         <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/40 to-transparent"></div>

         {/* Layer 4: Theme Tint Overlay (Subtle Pulse) */}
         <div 
            className="absolute inset-0 mix-blend-overlay opacity-20 animate-pulse-slow transition-colors duration-1000"
            style={{ backgroundColor: 'var(--accent-color)' }}
         ></div>
      </div>

      {/* Layer 5: Noise Texture (Adds premium grit) */}
      <div className="noise-overlay"></div>

      {/* Layer 6: Ambient Fog Background (Layered on top of live BG for depth) */}
      <div className="ambient-fog">
        <div className="fog-layer"></div>
        <div className="fog-layer-2"></div>
      </div>

      {/* Falling Items Overlay */}
      {fallingItems.map(item => (
        <div 
          key={item.id} 
          className={item.type === 'cat' ? "falling-cat" : "falling-heart"} 
          style={{ left: item.left, animationDelay: item.delay }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900/80 p-8 rounded-2xl border border-white/5 w-full max-w-md shadow-2xl backdrop-blur-xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-serif text-white">Curator Access</h3>
               <button onClick={() => setShowLogin(false)}><X className="text-zinc-500 hover:text-white"/></button>
             </div>
             <form onSubmit={handleLoginSubmit}>
               <input 
                type="password" 
                placeholder="Enter Passcode..." 
                className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white mb-4 focus:border-[var(--accent-color)] outline-none transition-colors placeholder-zinc-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
               />
               <button type="submit" className="w-full py-3 bg-zinc-100 text-black font-bold rounded-lg hover:bg-white transition-colors">Unlock</button>
             </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
          <div className="bg-zinc-900/90 p-0 rounded-2xl border border-white/5 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
             
             {/* Header with Tabs */}
             <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/20">
               <div className="flex gap-6">
                 <button 
                  onClick={() => setSettingsTab('dashboard')}
                  className={`text-lg font-serif transition-colors pb-1 border-b-2 ${settingsTab === 'dashboard' ? 'text-white border-[var(--accent-color)]' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                 >
                   Dashboard
                 </button>
                 <button 
                  onClick={() => setSettingsTab('founder')}
                  className={`text-lg font-serif transition-colors pb-1 border-b-2 ${settingsTab === 'founder' ? 'text-white border-[var(--accent-color)]' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                 >
                   Founder Profile
                 </button>
               </div>
               <button onClick={() => setShowSettings(false)}><X className="text-zinc-500 hover:text-white"/></button>
             </div>
             
             <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
               {/* --- DASHBOARD TAB --- */}
               {settingsTab === 'dashboard' && (
                 <>
                   {/* Treasury Section */}
                   <div className="mb-10 p-6 rounded-xl border border-amber-900/30 bg-amber-950/10">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                       <Wallet size={14}/> Treasury
                     </h4>
                     
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                       <div className="text-center md:text-left">
                         <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Funds</p>
                         <p className="text-5xl font-serif text-white">${balance.toFixed(2)}</p>
                       </div>
                       
                       <div className="flex flex-col items-center md:items-end">
                          <button 
                            onClick={handleWithdraw}
                            disabled={balance <= 0 || !linkedCard}
                            className="px-6 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <DollarSign size={16}/> Withdraw Funds
                          </button>
                          
                          <button
                            onClick={(e) => { e.preventDefault(); triggerCelebration(); }}
                            className="mt-2 px-4 py-2 bg-zinc-800 text-xs uppercase font-bold text-zinc-400 rounded hover:bg-zinc-700 transition-colors flex items-center gap-2"
                          >
                            <Heart size={12}/> Test Effect
                          </button>

                          {linkedCard && <p className="text-[10px] text-zinc-500 mt-2">To card ending in •••• {linkedCard}</p>}
                       </div>
                     </div>
                     
                     <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
                        <h5 className="text-xs font-bold text-zinc-400 mb-3">Linked Withdrawal Method</h5>
                        <form onSubmit={handleLinkCard} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Card Number" 
                            className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-700"
                            value={newCardNumber}
                            onChange={(e) => setNewCardNumber(e.target.value)}
                          />
                          <button type="submit" className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs uppercase font-bold rounded hover:bg-zinc-700">Link Card</button>
                        </form>
                     </div>
                   </div>

                   {/* Pending Approvals Section */}
                   <div className="mb-10">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                       <AlertCircle size={14}/> Pending Approvals ({pendingStories.length})
                     </h4>
                     
                     {pendingStories.length === 0 ? (
                       <div className="p-6 border border-zinc-800 border-dashed rounded-xl text-center text-zinc-600 italic text-sm">
                         The void is quiet. No tales await judgement.
                       </div>
                     ) : (
                       <div className="space-y-4">
                         {pendingStories.map(story => (
                           <div key={story.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                             <div className="flex-1">
                               <h5 className="font-serif text-lg text-zinc-200 font-bold mb-1">{story.title}</h5>
                               <p className="text-xs text-zinc-500 mb-2">By {story.authorName || 'Anonymous'}</p>
                               <p className="text-zinc-400 text-sm line-clamp-2">{story.excerpt}</p>
                             </div>
                             <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                               <button 
                                onClick={() => handleApproveStory(story)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-green-900/20 text-green-400 border border-green-900/30 rounded-lg hover:bg-green-900/40 transition-colors text-sm"
                                title="Approve & Publish"
                               >
                                 <Check size={14}/> <span className="sm:hidden">Approve</span>
                               </button>
                               <button 
                                onClick={() => handleRejectStory(story.id)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg hover:bg-red-900/40 transition-colors text-sm"
                                title="Reject & Delete"
                               >
                                 <Trash2 size={14}/> <span className="sm:hidden">Reject</span>
                               </button>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>

                   {/* Theme Settings */}
                   <div className="mb-10">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                        <Palette size={14}/> Theme Customization
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Accent Color</label>
                          <div className="flex gap-2">
                             <input 
                              type="color" 
                              value={theme.accentColor} 
                              onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                              className="h-10 w-10 bg-transparent border-0 rounded cursor-pointer"
                             />
                             <input 
                              type="text" 
                              value={theme.accentColor}
                              onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:outline-none text-sm"
                             />
                          </div>
                        </div>
                         <div className="flex flex-col gap-2">
                          <label className="text-[10px] text-zinc-400 uppercase tracking-wide">Text Color</label>
                          <div className="flex gap-2">
                             <input 
                              type="color" 
                              value={theme.textColor} 
                              onChange={(e) => setTheme({...theme, textColor: e.target.value})}
                              className="h-10 w-10 bg-transparent border-0 rounded cursor-pointer"
                             />
                             <input 
                              type="text" 
                              value={theme.textColor}
                              onChange={(e) => setTheme({...theme, textColor: e.target.value})}
                              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-white focus:outline-none text-sm"
                             />
                          </div>
                        </div>
                        <button 
                          onClick={handleSaveTheme}
                          className="col-span-1 sm:col-span-2 mt-2 px-4 py-2 bg-zinc-800 text-xs uppercase font-bold text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          Apply Theme
                        </button>
                      </div>
                   </div>

                   {/* Customize Subtitle */}
                   <div className="mb-10">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                       <Type size={14}/> Blog Subtitle
                     </h4>
                     <div className="flex flex-col gap-2">
                       <textarea
                         className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-[var(--accent-color)] outline-none min-h-[80px] text-sm"
                         placeholder="Enter the text to display under 'Nocturne Weave'..."
                         defaultValue={subtitle}
                         onChange={(e) => setNewSubtitle(e.target.value)}
                       />
                       <button 
                          onClick={handleSaveSubtitle}
                          className="self-end px-4 py-2 bg-zinc-800 text-xs uppercase font-bold text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          Save Text
                        </button>
                     </div>
                   </div>

                    {/* Background Settings */}
                   <div className="mb-10">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                        <ImageIcon size={14}/> Live Background Visual
                      </h4>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-[var(--accent-color)] outline-none text-sm"
                          placeholder="Enter image URL or Video URL (.mp4)"
                          defaultValue={bgImage}
                          onChange={(e) => setNewBgInput(e.target.value)}
                        />
                        <p className="text-[10px] text-zinc-500">Supports JPG, PNG, or .mp4/.webm video links.</p>
                        <button 
                           onClick={handleSaveBg}
                           className="self-end px-4 py-2 bg-zinc-800 text-xs uppercase font-bold text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                         >
                           Update Background
                         </button>
                      </div>
                   </div>

                   {/* Passcode Section */}
                   <div className="mb-6">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                       <Lock size={14}/> Security
                     </h4>
                     <form onSubmit={handleChangePasscode} className="flex gap-4">
                       <input 
                        type="text" 
                        placeholder="New passcode..." 
                        className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-[var(--accent-color)] outline-none text-sm"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                       />
                       <button type="submit" className="px-6 py-3 bg-zinc-800 text-zinc-200 font-bold rounded-lg hover:bg-zinc-700 transition-colors text-sm">Update</button>
                     </form>
                   </div>
                 </>
               )}
               
               {/* --- FOUNDER PROFILE TAB --- */}
               {settingsTab === 'founder' && (
                 <div className="animate-fade-in">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                     <User size={14}/> Edit Public Profile
                   </h4>
                   
                   <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] text-zinc-400 uppercase tracking-wide mb-2">Founder Name</label>
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-[var(--accent-color)] outline-none"
                          value={founderProfile.name}
                          onChange={(e) => setFounderProfile({...founderProfile, name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-zinc-400 uppercase tracking-wide mb-2">Tagline (Subtitle)</label>
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-[var(--accent-color)] outline-none"
                          value={founderProfile.tagline}
                          onChange={(e) => setFounderProfile({...founderProfile, tagline: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-zinc-400 uppercase tracking-wide mb-2">Portrait Image URL</label>
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-[var(--accent-color)] outline-none text-sm"
                          value={founderProfile.imageUrl}
                          onChange={(e) => setFounderProfile({...founderProfile, imageUrl: e.target.value})}
                        />
                        <div className="mt-2 h-40 w-32 bg-black overflow-hidden rounded border border-zinc-800">
                          {founderProfile.imageUrl && <img src={founderProfile.imageUrl} alt="Preview" className="w-full h-full object-cover grayscale"/>}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-zinc-400 uppercase tracking-wide mb-2">Bio / Story</label>
                        <textarea
                          className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-white focus:border-[var(--accent-color)] outline-none h-64 text-sm font-serif leading-relaxed"
                          value={founderProfile.bio}
                          onChange={(e) => setFounderProfile({...founderProfile, bio: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button 
                           onClick={handleSaveFounder}
                           className="px-6 py-3 bg-zinc-100 text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2"
                         >
                           <Check size={16}/> Save Profile
                         </button>
                      </div>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-void-950 z-50 flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 text-zinc-400">
            <X size={32} />
          </button>
          <button onClick={() => { setView('HOME'); setMobileMenuOpen(false); }} className={`text-3xl font-serif ${view === 'HOME' ? 'text-white' : 'text-zinc-500'}`}>Chronicles</button>
          <button onClick={() => { setView('COMMUNITY'); setMobileMenuOpen(false); }} className={`text-3xl font-serif ${view === 'COMMUNITY' ? 'text-white' : 'text-zinc-500'}`}>Community</button>
          <button onClick={() => { setView('FOUNDER'); setMobileMenuOpen(false); }} className={`text-3xl font-serif ${view === 'FOUNDER' ? 'text-white' : 'text-zinc-500'}`}>The Founder</button>
          <button onClick={() => { setView('DONATE'); setMobileMenuOpen(false); }} className={`text-3xl font-serif ${view === 'DONATE' ? 'text-white' : 'text-zinc-500'}`}>Support</button>
          
          {isOwner && (
             <button onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }} className="text-lg font-serif text-zinc-500 hover:text-white flex items-center gap-2">
               <Settings size={20} /> Settings
             </button>
          )}

          <button onClick={toggleLogin} className="text-sm font-serif text-zinc-600 flex items-center gap-2 mt-8">
            {isOwner ? <><Unlock size={14}/> Logout</> : <><Lock size={14}/> Curator Login</>}
          </button>
        </div>
      )}

      {/* Top Bar for Mobile */}
      <div className="md:hidden flex items-center justify-between p-6 sticky top-0 bg-void-950/80 backdrop-blur-md z-40 border-b border-zinc-900">
        <span className="font-serif font-bold text-xl" onClick={() => setView('HOME')}>Nocturne Weave</span>
        <button onClick={() => setMobileMenuOpen(true)} className="text-zinc-300">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-8 border-r border-white/5 bg-black/20 backdrop-blur-sm z-40">
        <div className="mb-12 cursor-pointer group" onClick={() => setView('HOME')}>
          <Ghost size={28} className="text-zinc-100 transition-colors" style={{ color: view === 'HOME' ? 'var(--accent-color)' : '' }} />
        </div>
        
        <div className="flex-1 flex flex-col gap-8 w-full items-center">
          <button 
            onClick={() => setView('HOME')}
            className={`p-3 rounded-xl transition-all relative group ${view === 'HOME' ? 'bg-zinc-800/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Official Chronicles"
          >
            <BookOpen size={20} />
            <span className="absolute left-14 bg-zinc-900 border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Blog</span>
          </button>
          
          <button 
            onClick={() => setView('COMMUNITY')}
            className={`p-3 rounded-xl transition-all relative group ${view === 'COMMUNITY' ? 'bg-zinc-800/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Community Whispers"
          >
            <Users size={20} />
             <span className="absolute left-14 bg-zinc-900 border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Community</span>
          </button>

          <button 
            onClick={() => setView('FOUNDER')}
            className={`p-3 rounded-xl transition-all relative group ${view === 'FOUNDER' ? 'bg-zinc-800/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="The Founder"
          >
            <User size={20} />
             <span className="absolute left-14 bg-zinc-900 border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Founder</span>
          </button>
          
          <button 
            onClick={() => setView('DONATE')}
            className={`p-3 rounded-xl transition-all relative group ${view === 'DONATE' ? 'bg-zinc-800/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Support"
          >
            <Heart size={20} />
             <span className="absolute left-14 bg-zinc-900 border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Support</span>
          </button>

          {isOwner && (
            <>
              <button 
                onClick={handleCreateNew}
                className={`p-3 rounded-xl transition-all relative group ${view === 'CREATE' ? 'bg-white/10 text-white' : 'text-[var(--accent-color)] hover:text-white'}`}
                title="New Entry"
              >
                <PenTool size={20} />
                <span className="absolute left-14 bg-zinc-900 border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Write</span>
              </button>

              <button 
                onClick={() => setShowSettings(true)}
                className="p-3 rounded-xl transition-all relative group text-zinc-600 hover:text-white"
                title="Settings"
              >
                <Settings size={20} />
                <span className="absolute left-14 bg-zinc-900 border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Settings</span>
              </button>
            </>
          )}
        </div>

        <button 
          onClick={toggleLogin}
          className={`mt-auto p-2 rounded-full transition-colors ${isOwner ? 'text-white' : 'text-zinc-800 hover:text-zinc-600'}`}
          style={{ color: isOwner ? 'var(--accent-color)' : '' }}
          title={isOwner ? "Logout" : "Curator Login"}
        >
          {isOwner ? <Unlock size={16}/> : <Lock size={16}/>}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="md:pl-20 min-h-screen relative z-10">
        {view === 'HOME' && renderHome()}
        {view === 'COMMUNITY' && renderCommunity()}
        {view === 'FOUNDER' && renderFounder()}
        {view === 'DONATE' && renderDonate()}
        {view === 'READ' && activeStory && (
          <StoryReader 
            story={activeStory} 
            onBack={() => setView(activeStory.authorType === 'OWNER' ? 'HOME' : 'COMMUNITY')} 
            onEdit={handleEditStory}
            canEdit={isOwner}
          />
        )}
        {(view === 'CREATE' || view === 'EDIT') && (
          <Editor 
            initialStory={view === 'EDIT' ? activeStory : undefined}
            onSave={handleSaveStory}
            onCancel={() => setView('HOME')}
            defaultAuthorType={isOwner ? 'OWNER' : 'GUEST'}
          />
        )}
      </main>
    </div>
  );
};

export default App;