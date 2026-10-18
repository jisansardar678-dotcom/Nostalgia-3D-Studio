import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  Maximize2,
  Plus,
  Trash2,
  Send,
  RotateCcw,
  Layers,
  Palette,
  Check,
  Heart,
  MessageSquare,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ColorMode, WordArtData, WordArtLayout, WordItem } from '../types';
import { MULTI_COLOR_SPECTRUM } from '../utils/particleGenerators';
import { WordArtCanvas } from './WordArtCanvas';
import { soundEngine } from '../utils/audio';

interface WordArtCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendWordArt: (data: WordArtData) => void;
  onLaunchFullScreenDemo: (data: WordArtData) => void;
}

interface EditorSnapshot {
  heading: string;
  description: string;
  responseButtonText: string;
  selectedLayout: WordArtLayout;
  selectedColorMode: ColorMode;
  wordList: WordItem[];
}
import {
  WishPreset,
  PresetCategory,
  CATEGORIZED_PRESETS as CATEGORIZED_PRESETS_DATA,
  ALL_QUICK_PRESETS,
} from '../data/quickWishPresets';

export type { WishPreset, PresetCategory };


export const APOLOGY_FORGIVENESS_WORDS: WordItem[] = ALL_QUICK_PRESETS[0].words;

export const CATEGORIZED_PRESETS: PresetCategory[] = CATEGORIZED_PRESETS_DATA;
/*

        title: 'Deep Love & Affection',
        heading: 'You Are My Universe 🪐✨',
        description: 'Shob shomoy shudhu tomar kotha mone pore...',
        response: 'Do You Love Me? 🫶',
        words: [
          { id: '1', text: 'My Universe 🪐', color: '#a855f7', size: 'large' },
          { id: '2', text: 'Sweetheart 💖', color: '#ff2d75', size: 'large' },
          { id: '3', text: 'Shona 🕊️', color: '#00f0ff', size: 'medium' },
          { id: '4', text: 'Heartbeat 💓', color: '#ff94c2', size: 'large' },
        ],
      },
      {
        id: 'r3',
        title: 'Missing Someone',
        heading: 'Missing You So Much 🥀',
        description: 'Kache thakle joriye dhortam...',
        response: 'Come Back Soon 🫂',
        words: [
          { id: '1', text: 'Miss You 🥀', color: '#ff3366', size: 'large' },
          { id: '2', text: 'Come Back 🫂', color: '#ffc700', size: 'large' },
          { id: '3', text: 'Hug Me 🤗', color: '#00f0ff', size: 'medium' },
        ],
      },
      {
        id: 'r4',
        title: 'Cute Appreciation',
        heading: 'My Sweetest Atongko 🦋',
        description: 'Tumi amar shobcheye bhalo lagar karon...',
        response: 'Forever Mine? 💍',
        words: [
          { id: '1', text: 'Atongko ⚡', color: '#ff2d75', size: 'large' },
          { id: '2', text: 'Cutest 🦋', color: '#00f0ff', size: 'large' },
          { id: '3', text: 'Forever Mine 💍', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'r5',
        title: 'Long Distance Love',
        heading: 'Miles Apart, Close At Heart ✈️❤️',
        description: 'Durotto shotteo bhalobasha kome ni...',
        response: 'Hug Me Through Screen 🤗',
        words: [
          { id: '1', text: 'Distance Means Nothing ✈️', color: '#38bdf8', size: 'large' },
          { id: '2', text: 'Close At Heart ❤️', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'r6',
        title: 'Midnight Nostalgia',
        heading: 'Midnight Nostalgia 🌙✨',
        description: 'Raat jagha ghumhin chokhe shudhu tomar smriti...',
        response: 'Are You Awake? 💭',
        words: [
          { id: '1', text: 'Midnight 🌙', color: '#a855f7', size: 'large' },
          { id: '2', text: 'Nostalgia ✨', color: '#ffc700', size: 'large' },
          { id: '3', text: 'Sleepless 💭', color: '#38bdf8', size: 'medium' },
        ],
      },
      {
        id: 'r7',
        title: 'Promise & Trust',
        heading: 'Forever Promise 🤝💫',
        description: 'Kono shorto chara shob shomoy pashe thakbo...',
        response: 'Trust Me? ✨',
        words: [
          { id: '1', text: 'Promise 🤝', color: '#10b981', size: 'large' },
          { id: '2', text: 'Always With You 💫', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'r8',
        title: 'Soulmate Connection',
        heading: 'Soulmate Connection ♾️🧿',
        description: 'Janina keno, tomake khub nijer mone hoy...',
        response: 'Soulmates Forever 💫',
        words: [
          { id: '1', text: 'Soulmate ♾️', color: '#a855f7', size: 'large' },
          { id: '2', text: 'Destiny 🧿', color: '#38bdf8', size: 'large' },
        ],
      },
    ],
  },
  {
    id: 'family',
    name: 'Family & Parents',
    icon: '👨‍👩‍👧',
    presets: [
      {
        id: 'f9',
        title: 'For Mom',
        heading: "World's Best Mom 🌸💕",
        description: 'Apnar duwa chara amar jibon osampurno...',
        response: 'Love You Ma 🥰',
        words: [
          { id: '1', text: 'Best Ma Ever 🌸', color: '#ff94c2', size: 'large' },
          { id: '2', text: 'Love You Ma 🥰', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'f10',
        title: 'For Dad',
        heading: 'My Hero, My Dad 🦸‍♂️✨',
        description: 'Apni amar shobcheye boro shohojogi o prena...',
        response: 'Respect & Love ❤️',
        words: [
          { id: '1', text: 'My Hero 🦸‍♂️', color: '#38bdf8', size: 'large' },
          { id: '2', text: 'Best Dad ✨', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'f11',
        title: 'Family Bond',
        heading: 'My Safe Haven (Family) 🏡🧿',
        description: 'Shob shomoy pashe thakar jonno shobar jonno duwa...',
        response: 'Blessed With Family ✨',
        words: [
          { id: '1', text: 'Family First 🏡', color: '#10b981', size: 'large' },
          { id: '2', text: 'Blessed 🧿', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'f12',
        title: 'Siblings Fun',
        heading: 'Partner in Crime 🐒😜',
        description: 'Jhogra korleo tumi amar shobcheye apon...',
        response: 'Best Sibling Ever 🍫',
        words: [
          { id: '1', text: 'Partner in Crime 🐒', color: '#f97316', size: 'large' },
          { id: '2', text: 'Crazy Sibling 🍫', color: '#a855f7', size: 'large' },
        ],
      },
      {
        id: 'f13',
        title: 'Parents Anniversary',
        heading: 'Happy Anniversary To My Parents 🥂❤️',
        description: 'Apnader bhalobasha amar shobcheye boro shikkha...',
        response: 'Stay Together Always 🧿',
        words: [
          { id: '1', text: 'Happy Anniversary 🥂', color: '#ffc700', size: 'large' },
          { id: '2', text: 'Pure Love ❤️', color: '#ff2d75', size: 'large' },
        ],
      },
    ],
  },
  {
    id: 'friends',
    name: 'Friends & Besties',
    icon: '👯‍♀️',
    presets: [
      {
        id: 'fr14',
        title: 'Bestie Love',
        heading: 'Bestu Forever 👯‍♀️💫',
        description: 'Shob shomoy shathe thakar jonno thank you...',
        response: 'Best Friends 4 Ever 🤝',
        words: [
          { id: '1', text: 'Bestu Forever 👯‍♀️', color: '#ff2d75', size: 'large' },
          { id: '2', text: 'BFF 💖', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'fr15',
        title: 'Crazy Friend Squad',
        heading: 'Pagol Dosto Squad 🤪🔥',
        description: 'Tomader sathe katano protiti muhurto special...',
        response: 'Squad Goals 🚀',
        words: [
          { id: '1', text: 'Pagol Dosto 🤪', color: '#f97316', size: 'large' },
          { id: '2', text: 'Squad Goals 🚀', color: '#38bdf8', size: 'large' },
        ],
      },
      {
        id: 'fr16',
        title: '3 AM Call Buddy',
        heading: 'My 3 AM Call Buddy 📞✨',
        description: 'Jekono bipode shobar age tomakei pashe peyechi...',
        response: 'True Friendship 💎',
        words: [
          { id: '1', text: '3 AM Buddy 📞', color: '#a855f7', size: 'large' },
          { id: '2', text: 'True Friend 💎', color: '#38bdf8', size: 'large' },
        ],
      },
      {
        id: 'fr17',
        title: 'Days We Met',
        heading: 'Days We Met 🕰️💛',
        description: 'Ki bhabe je shuru hoyechilo shei golpo gulo...',
        response: 'Remember Those Days? 📸',
        words: [
          { id: '1', text: 'Good Old Days 🕰️', color: '#ffc700', size: 'large' },
          { id: '2', text: 'Memories 📸', color: '#ff94c2', size: 'large' },
        ],
      },
      {
        id: 'fr18',
        title: 'Hostel / Mess Life',
        heading: 'Mess Life & Roommate Bond 🍜😂',
        description: 'Ei diner shriti gulo jibon vor mone thakbe...',
        response: 'Miss Those Days 🏫',
        words: [
          { id: '1', text: 'Mess Life 🍜', color: '#10b981', size: 'large' },
          { id: '2', text: 'Roommates 😂', color: '#f97316', size: 'large' },
        ],
      },
    ],
  },
  {
    id: 'celebrations',
    name: 'Special Days',
    icon: '🎉',
    presets: [
      {
        id: 'c19',
        title: 'Birthday Wish',
        heading: 'Happy Birthday My World 🎂🎉',
        description: 'Tomar jibon ta khushi te bhore jak...',
        response: 'Cut The Cake 🥳',
        words: [
          { id: '1', text: 'Happy Birthday 🎂', color: '#ffc700', size: 'large' },
          { id: '2', text: 'Party Time 🥳', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'c20',
        title: 'Anniversary Wish',
        heading: 'Happy Anniversary Love 🥂💖',
        description: 'Ekti bochor shathe thakar jonno dhonnobad...',
        response: 'Cheers to Us 🥂',
        words: [
          { id: '1', text: 'Happy Anniversary 🥂', color: '#ffc700', size: 'large' },
          { id: '2', text: 'Cheers To Us 💖', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'c21',
        title: "Valentine's Special",
        heading: "Happy Valentine's Day 🌹✨",
        description: 'Tumi amar shera upohar...',
        response: 'Be My Valentine 💌',
        words: [
          { id: '1', text: 'Valentine 🌹', color: '#ff2d75', size: 'large' },
          { id: '2', text: 'Be Mine 💌', color: '#ff94c2', size: 'large' },
        ],
      },
      {
        id: 'c22',
        title: 'Eid / Festive Joy',
        heading: 'Eid Mubarak My Love 🌙✨',
        description: 'Ei eid e tomake kache na pawar dukkho gulo...',
        response: 'Eid Hugs 🤗',
        words: [
          { id: '1', text: 'Eid Mubarak 🌙', color: '#10b981', size: 'large' },
          { id: '2', text: 'Festive Joy ✨', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'c23',
        title: 'New Year Celebration',
        heading: 'Happy New Year 2027 🎆🥂',
        description: 'Notun bochor ta amader shobkhani puron hok...',
        response: 'Cheers to New Beginning ✨',
        words: [
          { id: '1', text: 'Happy New Year 🎆', color: '#38bdf8', size: 'large' },
          { id: '2', text: 'New Beginnings ✨', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'c24',
        title: 'Exam / Success Wish',
        heading: 'Good Luck For Exam 📚🎯',
        description: 'Tumi ekhon sheratai korbe, ami jani...',
        response: 'You Will Ace It! 💪',
        words: [
          { id: '1', text: 'Good Luck 🎯', color: '#10b981', size: 'large' },
          { id: '2', text: 'You Will Ace It 💪', color: '#ffc700', size: 'large' },
        ],
      },
    ],
  },
  {
    id: 'mood',
    name: 'Mood & Fun',
    icon: '😊',
    presets: [
      {
        id: 'm25',
        title: 'Cheer Up / Motivation',
        heading: 'Cheer Up My Star ⭐💪',
        description: 'Shob thik hoye jabe, ami achhi to!',
        response: 'Smiling Now? 😊',
        words: [
          { id: '1', text: 'Cheer Up ⭐', color: '#ffc700', size: 'large' },
          { id: '2', text: 'You Got This 💪', color: '#10b981', size: 'large' },
        ],
      },
      {
        id: 'm26',
        title: 'Feeling Low',
        heading: 'Feeling Low Today 🌧️💔',
        description: 'Mon ta aj khub kharap lagche...',
        response: 'Talk To Me 🥺',
        words: [
          { id: '1', text: 'Feeling Low 🌧️', color: '#38bdf8', size: 'large' },
          { id: '2', text: 'Talk To Me 🥺', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'm27',
        title: 'Teasing & Fun',
        heading: 'Hey Pagli / Pagla Suncho? 😜🐒',
        description: 'Eto raag koro na to, bhalo lage na!',
        response: 'Stop Being Angry 🤭',
        words: [
          { id: '1', text: 'Hey Pagli 😜', color: '#f97316', size: 'large' },
          { id: '2', text: 'Don’t Be Angry 🤭', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'm28',
        title: 'Good Morning',
        heading: 'Good Morning Sunshine ☀️☕',
        description: 'Din ta shundor katuk tomar...',
        response: 'Send Morning Hug 🌤️',
        words: [
          { id: '1', text: 'Good Morning ☀️', color: '#ffc700', size: 'large' },
          { id: '2', text: 'Have A Great Day ☕', color: '#38bdf8', size: 'large' },
        ],
      },
      {
        id: 'm29',
        title: 'Good Night',
        heading: 'Sweet Dreams My Love 🌙💤',
        description: 'Ghumie poro, shupno dekho amar...',
        response: 'Good Night Kiss 🌙',
        words: [
          { id: '1', text: 'Sweet Dreams 🌙', color: '#a855f7', size: 'large' },
          { id: '2', text: 'Good Night 💤', color: '#38bdf8', size: 'large' },
        ],
      },
      {
        id: 'm30',
        title: 'Thank You Note',
        heading: 'Grateful For You 🌸✨',
        description: 'Jibone thakar jonno onek dhonnobad...',
        response: 'Love You Too 💖',
        words: [
          { id: '1', text: 'Grateful 🌸', color: '#ff94c2', size: 'large' },
          { id: '2', text: 'Thank You ✨', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'm31',
        title: 'Proud of You',
        heading: 'So Proud Of You 🏆🌟',
        description: 'Tumi amar shobcheye boro achiever...',
        response: 'You Rock! 🔥',
        words: [
          { id: '1', text: 'So Proud 🏆', color: '#ffc700', size: 'large' },
          { id: '2', text: 'You Rock 🔥', color: '#f97316', size: 'large' },
        ],
      },
      {
        id: 'm32',
        title: 'Surprise Message',
        heading: 'A Little Surprise For You 🎁✨',
        description: 'Tomar jonno ekta chotto bhalobasha...',
        response: 'Open Surprise 🔓',
        words: [
          { id: '1', text: 'Surprise 🎁', color: '#a855f7', size: 'large' },
          { id: '2', text: 'Special Wish ✨', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'm33',
        title: 'Coffee Date Invite',
        heading: 'Coffee Date Soon? ☕✨',
        description: 'Onek din adda hoy na, kobe boschi?',
        response: "Let's Go! 🏃‍♂️",
        words: [
          { id: '1', text: 'Coffee Date ☕', color: '#f97316', size: 'large' },
          { id: '2', text: "Let's Meet 🏃‍♂️", color: '#38bdf8', size: 'large' },
        ],
      },
      {
        id: 'm34',
        title: 'Rainy Day Vibes',
        heading: 'Romantic Rainy Day 🌧️☕',
        description: 'Ei brishtite tomar kotha khub mone porche...',
        response: 'Enjoying Rain? ☔',
        words: [
          { id: '1', text: 'Rainy Vibes 🌧️', color: '#38bdf8', size: 'large' },
          { id: '2', text: 'Coffee & Rain ☕', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'm35',
        title: 'Foodie Partner',
        heading: 'Food Partnering Time 🍕🍔',
        description: 'Aj ki khawa hocche bolo?',
        response: 'Treat Me! 🤤',
        words: [
          { id: '1', text: 'Foodie Partner 🍕', color: '#f97316', size: 'large' },
          { id: '2', text: 'Treat Me 🤤', color: '#ffc700', size: 'large' },
        ],
      },
      {
        id: 'm36',
        title: 'Missing School Days',
        heading: 'Old School Memories 🎒📸',
        description: 'Shei purono din gulo abar fire petam...',
        response: 'Nostalgic feels ✨',
        words: [
          { id: '1', text: 'School Days 🎒', color: '#38bdf8', size: 'large' },
          { id: '2', text: 'Nostalgia 📸', color: '#ff94c2', size: 'large' },
        ],
      },
      {
        id: 'm37',
        title: 'Quick Compliment',
        heading: 'You Look Stunning Today 💫👀',
        description: 'Tomake aj khub e shundor lagchilo...',
        response: 'Blushing? 😊',
        words: [
          { id: '1', text: 'Stunning 💫', color: '#ffc700', size: 'large' },
          { id: '2', text: 'Blushing 😊', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'm38',
        title: 'Relax & Take Care',
        heading: 'Take Care Of Yourself 🍵❤️',
        description: 'Nijer khub valo kore jotno nio...',
        response: 'I Will! 👍',
        words: [
          { id: '1', text: 'Take Care 🍵', color: '#10b981', size: 'large' },
          { id: '2', text: 'Stay Healthy ❤️', color: '#ff2d75', size: 'large' },
        ],
      },
      {
        id: 'm39',
        title: 'Evening Chill',
        heading: 'Sunset & Chill 🌅🎧',
        description: 'Gaan shunte shunte chole ashbo naki?',
        response: 'Sounds Good 🎶',
        words: [
          { id: '1', text: 'Sunset Chill 🌅', color: '#f97316', size: 'large' },
          { id: '2', text: 'Music & Vibes 🎧', color: '#a855f7', size: 'large' },
        ],
      },
      {
        id: 'm40',
        title: 'Random Smile Trigger',
        heading: 'Just Dropped By to Say Hi 👋😄',
        description: 'Ektu hansi mukhe thako, tomake bhalo lage...',
        response: 'Smiling! ❤️',
        words: [
          { id: '1', text: 'Keep Smiling 😄', color: '#ffc700', size: 'large' },
          { id: '2', text: 'Saying Hi 👋', color: '#38bdf8', size: 'large' },
        ],
      },
    ],
];
*/


export const WordArtCreatorModal: React.FC<WordArtCreatorModalProps> = ({
  isOpen,
  onClose,
  onSendWordArt,
  onLaunchFullScreenDemo,
}) => {
  const [heading, setHeading] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [responseButtonText, setResponseButtonText] = useState<string>('');
  const [selectedLayout, setSelectedLayout] = useState<WordArtLayout>('heart');
  const [selectedColorMode, setSelectedColorMode] = useState<ColorMode>('multi_auto');

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  const [wordList, setWordList] = useState<WordItem[]>(APOLOGY_FORGIVENESS_WORDS);
  const [isPresetActive, setIsPresetActive] = useState<boolean>(true);

  const [newWordInput, setNewWordInput] = useState<string>('');
  const [newWordColor, setNewWordColor] = useState<string>('#ff2d75');

  // Undo / Redo Stacks
  const [historyPast, setHistoryPast] = useState<EditorSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<EditorSnapshot[]>([]);

  // Capture snapshot before modifying state
  const pushHistorySnapshot = useCallback(() => {
    const snapshot: EditorSnapshot = {
      heading,
      description,
      responseButtonText,
      selectedLayout,
      selectedColorMode,
      wordList: [...wordList],
    };
    setHistoryPast((prev) => [...prev, snapshot]);
    setHistoryFuture([]);
  }, [heading, description, responseButtonText, selectedLayout, selectedColorMode, wordList]);

  // Perform Undo
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;

    soundEngine.playChime();
    const previousSnapshot = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);

    const currentSnapshot: EditorSnapshot = {
      heading,
      description,
      responseButtonText,
      selectedLayout,
      selectedColorMode,
      wordList: [...wordList],
    };

    setHistoryFuture((prev) => [currentSnapshot, ...prev]);
    setHistoryPast(newPast);

    setHeading(previousSnapshot.heading);
    setDescription(previousSnapshot.description);
    setResponseButtonText(previousSnapshot.responseButtonText);
    setSelectedLayout(previousSnapshot.selectedLayout);
    setSelectedColorMode(previousSnapshot.selectedColorMode);
    setWordList(previousSnapshot.wordList);
  }, [historyPast, heading, description, responseButtonText, selectedLayout, selectedColorMode, wordList]);

  // Perform Redo
  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;

    soundEngine.playChime();
    const nextSnapshot = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    const currentSnapshot: EditorSnapshot = {
      heading,
      description,
      responseButtonText,
      selectedLayout,
      selectedColorMode,
      wordList: [...wordList],
    };

    setHistoryPast((prev) => [...prev, currentSnapshot]);
    setHistoryFuture(newFuture);

    setHeading(nextSnapshot.heading);
    setDescription(nextSnapshot.description);
    setResponseButtonText(nextSnapshot.responseButtonText);
    setSelectedLayout(nextSnapshot.selectedLayout);
    setSelectedColorMode(nextSnapshot.selectedColorMode);
    setWordList(nextSnapshot.wordList);
  }, [historyFuture, heading, description, responseButtonText, selectedLayout, selectedColorMode, wordList]);

  // Keyboard Shortcuts (Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, handleRedo]);

  if (!isOpen) return null;

  const currentWordArtData: WordArtData = {
    title: 'My Custom 3D Wish ✨',
    heading: heading.trim() || 'Sorry Choroi Pakhi ❤️',
    description: description.trim() || 'Amar bhul hoyeche, maaf kore dao please...',
    responseButtonText: responseButtonText.trim() || 'Will You Forgive Me? 🥺',
    layout: selectedLayout,
    colorMode: selectedColorMode,
    words: wordList,
  };

  const handleApplyPreset = (preset: WishPreset) => {
    pushHistorySnapshot();
    soundEngine.playSparkleSound();
    setIsPresetActive(true);
    setHeading(preset.heading);
    setDescription(preset.description);
    setResponseButtonText(preset.response);
    if (preset.words && preset.words.length > 0) {
      setWordList(preset.words);
    } else {
      setWordList([]);
    }
  };

  const handleCustomHeadingChange = (value: string) => {
    if (isPresetActive) {
      pushHistorySnapshot();
      setIsPresetActive(false);
      setWordList([]);
    }
    setHeading(value);
  };

  const handleCustomDescriptionChange = (value: string) => {
    if (isPresetActive) {
      pushHistorySnapshot();
      setIsPresetActive(false);
      setWordList([]);
    }
    setDescription(value);
  };

  const handleCustomResponseChange = (value: string) => {
    if (isPresetActive) {
      pushHistorySnapshot();
      setIsPresetActive(false);
      setWordList([]);
    }
    setResponseButtonText(value);
  };

  const handleLayoutChange = (layoutId: WordArtLayout) => {
    if (layoutId === selectedLayout) return;
    pushHistorySnapshot();
    soundEngine.playChime();
    setSelectedLayout(layoutId);
  };

  const handleColorModeChange = (mode: ColorMode) => {
    if (mode === selectedColorMode) return;
    pushHistorySnapshot();
    soundEngine.playChime();
    setSelectedColorMode(mode);
  };

  const handleAddWord = () => {
    const trimmed = newWordInput.trim();
    if (!trimmed) return;
    pushHistorySnapshot();
    soundEngine.playChime();
    setIsPresetActive(false);
    setWordList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: trimmed,
        color: newWordColor,
        size: 'medium',
      },
    ]);
    setNewWordInput('');
  };

  const handleClearWords = () => {
    pushHistorySnapshot();
    soundEngine.playChime();
    setIsPresetActive(false);
    setWordList([]);
  };

  const handleRemoveWord = (id: string) => {
    pushHistorySnapshot();
    soundEngine.playChime();
    setWordList((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSend = () => {
    soundEngine.playSparkleSound();
    onSendWordArt(currentWordArtData);
  };

  // Get list of presets filtered by category
  const displayedPresets = activeCategoryTab === 'all'
    ? CATEGORIZED_PRESETS.flatMap((cat) => cat.presets)
    : CATEGORIZED_PRESETS.find((cat) => cat.id === activeCategoryTab)?.presets || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0a0f24]/95 border border-[#1e3066] rounded-3xl p-5 sm:p-6 text-white shadow-2xl shadow-[#1e3a8a]/20 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1e3a8a]/40 border border-[#2563eb]/50 text-[#38bdf8]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Create 3D Wish & Word Art</h2>
              <p className="text-xs text-white/60">Heading, subtitle, multi-colors & 3D words cloud</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo / Redo Controls */}
            <div className="flex items-center gap-1 bg-[#111833] border border-[#1e2e5c] rounded-xl p-1">
              <button
                onClick={handleUndo}
                disabled={historyPast.length === 0}
                className={`p-1.5 rounded-lg transition-all ${
                  historyPast.length > 0
                    ? 'hover:bg-white/10 text-white hover:text-[#38bdf8] active:scale-90'
                    : 'text-white/20 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleRedo}
                disabled={historyFuture.length === 0}
                className={`p-1.5 rounded-lg transition-all ${
                  historyFuture.length > 0
                    ? 'hover:bg-white/10 text-white hover:text-[#38bdf8] active:scale-90'
                    : 'text-white/20 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
          {/* Section 1: Live 3D Real-Time Preview Card */}
          <div className="relative w-full h-48 sm:h-56 rounded-2xl bg-[#060a17] border border-[#1d2d5c] overflow-hidden group shadow-inner">
            {/* Live Top-Left Heading & Subtitle Glassmorphism Panel */}
            <div className="absolute top-2.5 left-2.5 z-20 max-w-[54%] sm:max-w-[58%] pointer-events-none text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111936]/90 border border-amber-400/40 text-amber-300 text-[9px] sm:text-[10px] font-extrabold backdrop-blur-md shadow-sm">
                <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 animate-spin-slow" />
                <span>3D Live Preview</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md shadow-xl space-y-0.5">
                <div className="text-[11px] sm:text-xs font-black text-[#ff2d75] drop-shadow truncate">
                  {heading.trim() || 'Sorry Choroi Pakhi ❤️'}
                </div>
                <div className="text-[9px] sm:text-[10px] text-white/85 font-medium line-clamp-2 leading-snug">
                  {description.trim() || 'Amar bhul hoyeche, maaf kore dao please...'}
                </div>
              </div>
            </div>

            {/* Live Three.js Preview with Full Screen 3D control */}
            <WordArtCanvas
              wordArtData={currentWordArtData}
              isInteractive={true}
              showExplodeButton={false}
              onLaunchFullScreen={() => onLaunchFullScreenDemo(currentWordArtData)}
            />
          </div>

          {/* Categorized 40 Quick Wish Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/90 flex items-center gap-1">
                <span>Quick Wish Presets (40)</span>
              </label>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setActiveCategoryTab('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                  activeCategoryTab === 'all'
                    ? 'bg-[#2563eb] text-white shadow-md'
                    : 'bg-[#111833] text-white/60 hover:text-white border border-[#1e2e5c]'
                }`}
              >
                All (40)
              </button>
              {CATEGORIZED_PRESETS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryTab(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
                    activeCategoryTab === cat.id
                      ? 'bg-[#2563eb] text-white shadow-md'
                      : 'bg-[#111833] text-white/60 hover:text-white border border-[#1e2e5c]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Preset Buttons Grid */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1.5 bg-[#080d21] border border-[#172554] rounded-2xl">
              {displayedPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#111833] border border-[#1e2e5c] hover:border-pink-500/50 hover:bg-[#1e2952] text-xs font-medium text-white/90 hover:text-white transition-all text-left flex items-center gap-1 active:scale-95 shrink-0"
                  title={`${preset.heading} - ${preset.description}`}
                >
                  <span className="truncate max-w-[170px] sm:max-w-[210px]">{preset.heading}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wish Heading & Description Inputs */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-[#111833]/80 border border-[#1e2e5c]">
            <div>
              <label className="text-xs font-bold text-pink-300 flex items-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-[#ff2d75]" />
                Wish Heading / Greeting
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={heading}
                  onFocus={pushHistorySnapshot}
                  onChange={(e) => handleCustomHeadingChange(e.target.value)}
                  placeholder="Write a warm wish or heading... (যেমন: Sorry Choroi Pakhi ❤️)"
                  className="w-full bg-[#0a0f24] border border-[#1e2e5c] rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff2d75] resize-none leading-relaxed"
                />
                {heading && (
                  <button
                    type="button"
                    onClick={() => {
                      pushHistorySnapshot();
                      handleCustomHeadingChange('');
                    }}
                    className="absolute right-2.5 top-2.5 text-white/40 hover:text-white p-0.5"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 flex items-center gap-1 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Subtitle Description Note
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={description}
                  onFocus={pushHistorySnapshot}
                  onChange={(e) => handleCustomDescriptionChange(e.target.value)}
                  placeholder="Write your short story or heartfelt message here... (যেমন: Amar bhul hoyeche, maaf kore dao please...)"
                  className="w-full bg-[#0a0f24] border border-[#1e2e5c] rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#38bdf8] resize-none leading-relaxed"
                />
                {description && (
                  <button
                    type="button"
                    onClick={() => {
                      pushHistorySnapshot();
                      handleCustomDescriptionChange('');
                    }}
                    className="absolute right-2.5 top-2.5 text-white/40 hover:text-white p-0.5"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-300 block mb-1">
                Bottom Interactive Response Button Text
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={responseButtonText}
                  onFocus={pushHistorySnapshot}
                  onChange={(e) => handleCustomResponseChange(e.target.value)}
                  placeholder="Write a short question with Yes/No or reply options... (যেমন: Will you forgive me? 🥺)"
                  className="w-full bg-[#0a0f24] border border-[#1e2e5c] rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 resize-none leading-relaxed"
                />
                {responseButtonText && (
                  <button
                    type="button"
                    onClick={() => {
                      pushHistorySnapshot();
                      handleCustomResponseChange('');
                    }}
                    className="absolute right-2.5 top-2.5 text-white/40 hover:text-white p-0.5"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Color Mode Selection (Auto Multi-Color vs Themes) */}
          <div>
            <label className="text-xs font-bold text-white/80 flex items-center gap-1 mb-2">
              <Palette className="w-4 h-4 text-[#38bdf8]" />
              <span>Color Combination Mode</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleColorModeChange('multi_auto')}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  selectedColorMode === 'multi_auto'
                    ? 'bg-gradient-to-r from-[#2563eb]/40 to-[#7c3aed]/40 border-[#38bdf8] text-white ring-1 ring-[#38bdf8]'
                    : 'bg-[#111833]/80 border-[#1d2d5c] text-white/70 hover:text-white'
                }`}
              >
                <span>🌈 Multi-Color (Auto)</span>
                {selectedColorMode === 'multi_auto' && <Check className="w-3.5 h-3.5 text-[#38bdf8]" />}
              </button>

              <button
                onClick={() => handleColorModeChange('rose_gold')}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                  selectedColorMode === 'rose_gold'
                    ? 'bg-[#2b103c] border-[#ff2d75] text-white ring-1 ring-[#ff2d75]'
                    : 'bg-[#111833]/80 border-[#1d2d5c] text-white/70'
                }`}
              >
                <span>Rose Gold 💖</span>
                {selectedColorMode === 'rose_gold' && <Check className="w-3.5 h-3.5 text-[#ff2d75]" />}
              </button>
            </div>
          </div>

          {/* 3D Layout Selection */}
          <div>
            <label className="text-xs font-bold text-white/80 flex items-center gap-1 mb-2">
              <Layers className="w-4 h-4 text-[#38bdf8]" />
              <span>3D Layout Cluster</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'heart' as const, name: '3D Heart Cluster' },
                { id: 'helix' as const, name: '3D Spiral Helix' },
                { id: 'globe' as const, name: '3D Globe Orb' },
                { id: 'saturn' as const, name: '3D Saturn Ring' },
              ].map((layout) => {
                const isActive = selectedLayout === layout.id;
                return (
                  <button
                    key={layout.id}
                    onClick={() => handleLayoutChange(layout.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-[#172554] border-[#3b82f6] text-white ring-1 ring-[#3b82f6]'
                        : 'bg-[#111833]/80 border-[#1d2d5c] text-white/70'
                    }`}
                  >
                    {layout.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Words List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/80">
                Floating 3D Words Cloud ({wordList.length})
              </span>
              {wordList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearWords}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Input Row with Color Picker */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                placeholder="Type custom word (e.g. Bestu 🥺)"
                className="flex-1 bg-[#111833] border border-[#1e2e5c] rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#38bdf8]"
              />

              {/* Enhanced Color Picker */}
              <div className="flex items-center gap-1.5 bg-[#111833] border border-[#1e2e5c] rounded-xl px-2 py-1">
                {['#ff2d75', '#38bdf8', '#ffc700', '#10b981', '#a855f7', '#ff6b6b'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewWordColor(c)}
                    className={`w-4 h-4 rounded-full border transition-transform ${
                      newWordColor === c ? 'scale-125 border-white ring-2 ring-white/40' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
                <label className="relative cursor-pointer flex items-center justify-center p-0.5 rounded-md hover:bg-white/10" title="Custom Color Picker">
                  <Palette className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <input
                    type="color"
                    value={newWordColor}
                    onChange={(e) => setNewWordColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>

              <button
                onClick={handleAddWord}
                className="px-3.5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Added Words Badge List or Empty State Notice */}
            <div className="bg-[#0b1021] border border-[#1c2a52] rounded-2xl p-2.5 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
              {wordList.length === 0 ? (
                <div className="py-4 text-center text-xs text-white/60 space-y-1">
                  <p className="font-semibold text-amber-300 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Empty Floating Words Cloud</span>
                  </p>
                  <p className="text-[11px] text-white/50 max-w-xs mx-auto">
                    Type a custom word above, pick your color, and click <strong className="text-blue-400">Add</strong> to create your personal 3D word cloud!
                  </p>
                </div>
              ) : (
                wordList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#131f42] border border-[#23386b] text-xs font-medium text-white"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: item.color || '#ff2d75' }}
                      />
                      <span>{item.text}</span>
                    </span>
                    <button
                      onClick={() => handleRemoveWord(item.id)}
                      className="p-1 hover:bg-white/10 text-white/50 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#111833] hover:bg-[#19244a] text-white/80 hover:text-white text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send 3D Wish & Share Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
