import React, { useState } from 'react';
import { X, Gift, Sparkles, Copy, Check, Heart, Send, Volume2 } from 'lucide-react';
import { ShapeType } from '../types';
import { soundEngine } from '../utils/audio';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShape: ShapeType;
}

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, currentShape }) => {
  const [recipient, setRecipient] = useState<string>('Someone Special');
  const [sender, setSender] = useState<string>('Nostalgia 3D Studio');
  const [giftNote, setGiftNote] = useState<string>(
    'You shine brighter than any constellation in the galaxy! Enjoy this 3D stardust experience 💖'
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isOpened, setIsOpened] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOpenEnvelope = () => {
    soundEngine.playSparkleSound();
    soundEngine.playHeartbeatSound();
    setIsOpened(true);
  };

  const handleCopyLink = () => {
    soundEngine.playChime();
    const shareUrl = `${window.location.origin}?gift=1&recipient=${encodeURIComponent(
      recipient
    )}&shape=${currentShape}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#160a28] border border-[#ff2d75]/50 rounded-3xl p-6 text-white shadow-2xl shadow-[#ff2d75]/20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ff2d75]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#b812ff]/30 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isOpened ? (
          /* ENVELOPE FRONT VIEW */
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff2d75] to-[#b812ff] flex items-center justify-center shadow-lg shadow-[#ff2d75]/40 animate-bounce">
              <Gift className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-bold bg-gradient-to-r from-white via-pink-100 to-[#ff2d75] bg-clip-text text-transparent">
              Send a 3D Stardust Gift Card
            </h2>
            <p className="text-xs text-white/70 max-w-xs leading-relaxed">
              Surprise your friend or loved one with an interactive 3D particle theme in Messenger!
            </p>

            {/* Customizer Inputs */}
            <div className="w-full space-y-3 text-left pt-2">
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-[#1e0e36] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">Personal Greeting Note</label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full bg-[#1e0e36] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2d75] resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleOpenEnvelope}
              className="w-full py-3 bg-gradient-to-r from-[#ff2d75] to-[#b812ff] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff2d75]/40 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              Preview & Open Gift Card
            </button>
          </div>
        ) : (
          /* INSIDE GIFT CARD REVEAL VIEW */
          <div className="flex flex-col items-center text-center py-2 space-y-4 animate-scale-up">
            <div className="p-3 rounded-full bg-[#ff2d75]/20 border border-[#ff2d75]/50">
              <Heart className="w-8 h-8 text-[#ff2d75] fill-[#ff2d75] animate-pulse" />
            </div>

            <div>
              <span className="text-xs text-[#ff2d75] font-bold uppercase tracking-wider">
                Special 3D Gift For
              </span>
              <h3 className="text-2xl font-black text-white mt-0.5">{recipient}</h3>
            </div>

            <div className="w-full p-4 rounded-2xl bg-[#1e0e36]/80 border border-[#ff2d75]/30 relative text-center">
              <p className="text-xs text-pink-100 italic leading-relaxed">"{giftNote}"</p>
              <span className="text-[10px] text-white/50 block mt-2 text-right">— With love from {sender}</span>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-[#ff2d75] hover:bg-[#e02065] text-white font-bold text-xs rounded-xl shadow-md shadow-[#ff2d75]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Share Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Shareable 3D Gift Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsOpened(false)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Edit Gift Card Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
