import React, { useState } from 'react';
import { ArrowLeft, Send, Heart, Sparkles, Image, Gift, Smile, Phone, Video } from 'lucide-react';
import { ShapeType } from '../types';
import { soundEngine } from '../utils/audio';

interface MessengerOverlayProps {
  onReturnToStudio: () => void;
  currentShape: ShapeType;
  onOpenGiftModal: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'friend' | 'user';
  text: string;
  time: string;
  hasGiftCard?: boolean;
}

export const MessengerOverlay: React.FC<MessengerOverlayProps> = ({
  onReturnToStudio,
  currentShape,
  onOpenGiftModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'friend',
      text: 'Hey! Check out this 3D Nostalgia particle theme I activated for our chat! 🌌',
      time: '9:28 PM',
    },
    {
      id: '2',
      sender: 'friend',
      text: 'I sent you a 3D Heart Mesh gift below! Tap to open or switch shapes anytime. 💖',
      time: '9:28 PM',
      hasGiftCard: true,
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    soundEngine.playChime();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      time: '9:29 PM',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Automatic friend response simulation
    setTimeout(() => {
      soundEngine.playSparkleSound();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'friend',
          text: 'Super cool! The 3D particles look amazing! ✨',
          time: '9:29 PM',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-black/40 backdrop-blur-[2px] pointer-events-auto">
      {/* Messenger Chat Top Bar */}
      <div className="px-4 py-3 bg-[#11081f]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToStudio}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Return to 3D Studio"
          >
            <ArrowLeft className="w-5 h-5 text-[#ff2d75]" />
          </button>

          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff2d75] to-[#b812ff] flex items-center justify-center font-bold text-xs text-white ring-2 ring-[#ff2d75]/50">
              N3D
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-[#11081f]" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              Nostalgia 3D Messenger
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#ff2d75]/30 text-pink-200 border border-[#ff2d75]/50">
                AR Theme
              </span>
            </h2>
            <p className="text-[11px] text-white/60">Active now • Live 3D Background</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToStudio}
            className="px-3 py-1.5 rounded-full bg-[#ff2d75]/20 border border-[#ff2d75]/50 text-white text-xs font-semibold hover:bg-[#ff2d75]/40 transition-colors"
          >
            Full Studio
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-[#ff2d75] to-[#b812ff] text-white rounded-br-none'
                  : 'bg-[#1e102d]/90 border border-white/10 text-white/90 rounded-bl-none backdrop-blur-md'
              }`}
            >
              <p>{msg.text}</p>

              {/* Special interactive 3D Gift preview card in chat */}
              {msg.hasGiftCard && (
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-[#ff2d75]/40 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-pink-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-[#ff2d75]" />
                    <span>3D Interactive Gift Card</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Active Shape: <strong className="text-white capitalize">{currentShape}</strong>
                  </p>
                  <button
                    onClick={onOpenGiftModal}
                    className="w-full py-1.5 bg-[#ff2d75] hover:bg-[#e02065] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-[#ff2d75]/30 transition-all active:scale-95"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    Open 3D Gift Studio
                  </button>
                </div>
              )}

              <span className="text-[9px] opacity-60 block text-right mt-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reaction Pill Bar */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#11081f]/60 backdrop-blur-sm border-t border-white/5">
        <button
          onClick={() => {
            setInputMessage('💖 I love this 3D theme!');
            handleSendMessage();
          }}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#ff2d75]/30 text-white text-xs whitespace-nowrap transition-colors"
        >
          💖 I love this 3D theme!
        </button>
        <button
          onClick={onOpenGiftModal}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#ff2d75]/30 text-white text-xs whitespace-nowrap transition-colors flex items-center gap-1"
        >
          <Gift className="w-3 h-3 text-[#ff2d75]" /> Send 3D Gift
        </button>
        <button
          onClick={onReturnToStudio}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#ff2d75]/30 text-white text-xs whitespace-nowrap transition-colors"
        >
          ✨ Change 3D Shape
        </button>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-[#11081f]/95 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-[#1d0e30] border border-white/10 rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff2d75]"
        />
        <button
          onClick={handleSendMessage}
          className="p-2.5 rounded-full bg-gradient-to-r from-[#ff2d75] to-[#b812ff] text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#ff2d75]/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
