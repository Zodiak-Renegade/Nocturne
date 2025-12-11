
import { Story } from '../types';

const STORAGE_KEY = 'nocturne_stories';
const PASSCODE_KEY = 'nocturne_passcode';
const SUBTITLE_KEY = 'nocturne_subtitle';
const BG_IMAGE_KEY = 'nocturne_bg_image';
const THEME_KEY = 'nocturne_theme';
const BALANCE_KEY = 'nocturne_balance';
const LINKED_CARD_KEY = 'nocturne_linked_card';
const FOUNDER_KEY = 'nocturne_founder';
const LOGS_KEY = 'nocturne_logs';

export interface ThemeSettings {
  accentColor: string;
  textColor: string;
}

export interface FounderProfile {
  name: string;
  tagline: string;
  bio: string;
  imageUrl: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  action: string;
  details: string;
}

export const getStories = (): Story[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveStory = (story: Story): void => {
  const stories = getStories();
  const index = stories.findIndex(s => s.id === story.id);
  if (index >= 0) {
    stories[index] = story;
  } else {
    stories.unshift(story);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  // Note: Internal usage of logActivity here is fine, but we also export it now.
  if (index === -1) {
     // We can't easily call the exported logActivity here due to circular deps if we imported it, 
     // but since we are defining it in this file, we can just use the function implementation directly if we moved it up,
     // or just rely on the App.tsx to log major user actions.
     // For simplicity in this file structure, we'll leave internal logging minimal or move logActivity definition up.
  }
};

export const deleteStory = (id: string): void => {
  const stories = getStories().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
};

export const getStoryById = (id: string): Story | undefined => {
  return getStories().find(s => s.id === id);
};

export const getPasscode = (): string => {
  return localStorage.getItem(PASSCODE_KEY) || 'void'; 
};

export const verifyPasscode = async (input: string): Promise<boolean> => {
  const stored = getPasscode();
  if (stored === 'void') return input === 'void';
  
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === stored;
};

export const savePasscode = async (code: string): Promise<void> => {
  const msgBuffer = new TextEncoder().encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  localStorage.setItem(PASSCODE_KEY, hashHex);
};

export const getHeroSubtitle = (): string => {
  return localStorage.getItem(SUBTITLE_KEY) || "The Official Chronicles. Tales from the curator of the dark.";
};

export const saveHeroSubtitle = (text: string): void => {
  localStorage.setItem(SUBTITLE_KEY, text);
};

export const getBackgroundImage = (): string => {
  return localStorage.getItem(BG_IMAGE_KEY) || 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2670&auto=format&fit=crop';
};

export const saveBackgroundImage = (url: string): void => {
  localStorage.setItem(BG_IMAGE_KEY, url);
};

export const getThemeSettings = (): ThemeSettings => {
  const data = localStorage.getItem(THEME_KEY);
  return data ? JSON.parse(data) : { accentColor: '#8a0000', textColor: '#e0e0e0' };
};

export const saveThemeSettings = (settings: ThemeSettings): void => {
  localStorage.setItem(THEME_KEY, JSON.stringify(settings));
};

export const getFounderProfile = (): FounderProfile => {
  const data = localStorage.getItem(FOUNDER_KEY);
  return data ? JSON.parse(data) : {
    name: "The Curator",
    tagline: "Weaving shadows into stories.",
    bio: "I have always been drawn to the dark. Not for the fear it brings, but for the silence it offers.\n\nHere in the Nocturne Weave, I collect the whispers that others ignore. Every story is a thread, and every thread binds us closer to the void. My work is not to scare you, but to remind you that you are not alone in the dark.",
    imageUrl: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=2000&auto=format&fit=crop"
  };
};

export const saveFounderProfile = (profile: FounderProfile): void => {
  localStorage.setItem(FOUNDER_KEY, JSON.stringify(profile));
};

export const getBalance = (): number => {
  return parseFloat(localStorage.getItem(BALANCE_KEY) || '0.00');
};

export const addToBalance = (amount: number): void => {
  const current = getBalance();
  localStorage.setItem(BALANCE_KEY, (current + amount).toFixed(2));
};

export const withdrawBalance = (): void => {
  localStorage.setItem(BALANCE_KEY, '0.00');
};

export const getLinkedCard = (): string => {
  const encoded = localStorage.getItem(LINKED_CARD_KEY);
  if (!encoded) return '';
  try {
    return atob(encoded); 
  } catch (e) {
    return '';
  }
};

export const saveLinkedCard = (last4: string): void => {
  localStorage.setItem(LINKED_CARD_KEY, btoa(last4));
};

// Activity Logs
export const getLogs = (): LogEntry[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const logActivity = (action: string, details: string): void => {
  const logs = getLogs();
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    action,
    details
  };
  logs.unshift(entry);
  if (logs.length > 100) logs.pop(); // Keep last 100
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const clearLogs = (): void => {
  localStorage.removeItem(LOGS_KEY);
};

export const seedInitialData = () => {
  if (getStories().length === 0) {
    const initialStories: Story[] = [
      {
        id: '1',
        title: 'The Clockwork Heart',
        excerpt: 'It beat not with blood, but with the steady rhythm of a dying star trapped in brass.',
        content: `The artisan wiped grease from his forehead, leaving a smudge that looked uncomfortably like a bruise. "It is finished," he whispered, though the workshop was empty save for the echoes of ticking clocks.\n\nOn the table lay the heart. It was a marvel of gears and springs, encased in a cage of tarnished gold. It did not thump; it clicked. A precise, mechanical staccato that seemed to count down the seconds of an unseen lifespan.\n\nHe had traded his own heart for the knowledge to build it. A deal made at a crossroads where the shadows stretched longer than the light allowed. Now, staring at the creation, he wondered if the recipient—a porcelain doll that sat lifeless in the corner—would thank him, or if she would simply wind him up until he broke.`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ['Steampunk', 'Horror', 'Short'],
        isPublished: true,
        coverImage: 'https://picsum.photos/800/600?grayscale',
        authorType: 'OWNER',
        authorName: 'The Curator'
      },
      {
        id: '2',
        title: 'Silence in the Hallway',
        excerpt: 'The door was closed, but I could hear breathing from the other side.',
        content: `I live alone. That is the first fact. The second fact is that my apartment is on the top floor, and the only access is a fire escape that rusted shut in '98.\n\nSo when I heard the breathing, wet and heavy, pressing against the wood of my bedroom door, I didn't reach for a weapon. I reached for the light switch. But the darkness was absolute, a physical weight that pressed against my eyes.\n\n"Let me in," the voice rasped. It sounded like my own voice, recorded and played back on a decaying tape loop. "We have so much to discuss regarding tomorrow."\n\nI don't know what happens tomorrow. I'm afraid to check the calendar.`,
        createdAt: Date.now() - 100000,
        updatedAt: Date.now(),
        tags: ['Thriller', 'Psychological'],
        isPublished: true,
        coverImage: 'https://picsum.photos/800/601?grayscale',
        authorType: 'OWNER',
        authorName: 'The Curator'
      },
      {
        id: '3',
        title: 'The Cat That Wasn\'t There',
        excerpt: 'It meowed, but the sound came from inside the walls.',
        content: `We loved that cat. It was a stray that wandered in during the storm. But after it passed away, we buried it in the garden.\n\nLast night, I felt weight on the end of the bed. Familiar weight. I reached out to pet it, expecting soft fur. Instead, my hand passed through something cold, like river water in winter. Then I heard it—the purring. It wasn't coming from the bed. It was vibrating the floorboards from beneath.`,
        createdAt: Date.now() - 200000,
        updatedAt: Date.now(),
        tags: ['Community', 'Ghost'],
        isPublished: true,
        coverImage: 'https://picsum.photos/seed/cat/800/600?grayscale',
        authorType: 'GUEST',
        authorName: 'Anonymous Wanderer'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStories));
  }
};
