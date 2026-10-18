import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Sparkles, Eye, Cloud, Share2, Send, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { WordArtData } from '../types';
import { soundEngine } from '../utils/audio';
import { saveSharedWishToFirestore } from '../utils/firebase';

interface ShareDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordArtData: WordArtData;
  onLaunchDemo: () => void;
}

export const ShareDemoModal: React.FC<ShareDemoModalProps> = ({
  isOpen,
  onClose,
  wordArtData,
  onLaunchDemo,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [firestoreWishId, setFirestoreWishId] = useState<string | null>(null);

  // Sync shared wish to Firebase Firestore on modal open
  useEffect(() => {
    if (isOpen) {
      saveSharedWishToFirestore(wordArtData).then((id) => {
        if (id) {
          setFirestoreWishId(id);
        }
      });
    }
  }, [isOpen, wordArtData]);

  if (!isOpen) return null;

  // Encode full wordArtData into shareable URL parameters + wishId if available
  const encodedWords = encodeURIComponent(JSON.stringify(wordArtData.words));
  let shareUrl = `${window.location.origin}${window.location.pathname}?heading=${encodeURIComponent(
    wordArtData.heading
  )}&desc=${encodeURIComponent(wordArtData.description)}&resp=${encodeURIComponent(
    wordArtData.responseButtonText
  )}&layout=${wordArtData.layout}&cmode=${wordArtData.colorMode}&words=${encodedWords}`;

  if (firestoreWishId) {
    shareUrl = `${window.location.origin}${window.location.pathname}?wishId=${firestoreWishId}&heading=${encodeURIComponent(
      wordArtData.heading
    )}&desc=${encodeURIComponent(wordArtData.description)}&resp=${encodeURIComponent(
      wordArtData.responseButtonText
    )}&layout=${wordArtData.layout}&cmode=${wordArtData.colorMode}&words=${encodedWords}`;
  }

  const shareText = `✨ Special 3D Wish for you: "${wordArtData.heading}"\nOpen & interact in 3D Studio: ${shareUrl}`;

  const handleCopy = () => {
    soundEngine.playChime();
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    soundEngine.playSparkleSound();
    if (navigator.share) {
      try {
        await navigator.share({
          title: wordArtData.heading,
          text: `✨ Special 3D Wish: "${wordArtData.heading}"`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handleShareWhatsApp = () => {
    soundEngine.playChime();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    soundEngine.playChime();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    soundEngine.playChime();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `✨ Special 3D Wish: "${wordArtData.heading}"`
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    soundEngine.playChime();
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      `✨ Special 3D Wish: "${wordArtData.heading}"`
    )}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    soundEngine.playChime();
    const url = `mailto:?subject=${encodeURIComponent(`3D Wish: ${wordArtData.heading}`)}&body=${encodeURIComponent(shareText)}`;
    window.open(url, '_self');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a0f24] border border-[#2563eb]/50 rounded-3xl p-6 text-white shadow-2xl shadow-blue-500/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff2d75] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-pink-500/40 animate-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Your 3D Wish Link is Ready! 🎉</h3>
            <p className="text-xs text-pink-200 mt-1">"{wordArtData.heading}"</p>
            {firestoreWishId && (
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[10px] text-blue-300 font-medium">
                <Cloud className="w-3 h-3 text-blue-400" />
                Firebase Cloud Persisted
              </span>
            )}
          </div>

          {/* Share Link Input */}
          <div className="w-full bg-[#111833] border border-[#1e2e5c] rounded-2xl p-3 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-blue-200 focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* 1-Click Social Media Sharing Options */}
          <div className="w-full space-y-2 text-left">
            <span className="text-xs font-bold text-white/80 block">Share Directly to Social Media:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="p-2.5 rounded-xl bg-[#075e54]/80 hover:bg-[#128c7e] border border-emerald-500/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareFacebook}
                className="p-2.5 rounded-xl bg-[#1877f2]/80 hover:bg-[#166fe5] border border-blue-400/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4 text-blue-300" />
                <span>Facebook</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="p-2.5 rounded-xl bg-[#1da1f2]/80 hover:bg-[#0c85d0] border border-sky-400/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-4 h-4 text-sky-200" />
                <span>Twitter / X</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="p-2.5 rounded-xl bg-[#0088cc]/80 hover:bg-[#0077b3] border border-cyan-400/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4 text-cyan-200" />
                <span>Telegram</span>
              </button>
            </div>

            {/* Additional Share Actions: Email & Mobile Native Share */}
            <div className="flex gap-2 pt-1">
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Sheet</span>
                </button>
              )}

              <button
                onClick={handleShareEmail}
                className="flex-1 py-2.5 rounded-xl bg-[#1f2937] hover:bg-[#374151] border border-gray-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Mail className="w-4 h-4 text-gray-300" />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                soundEngine.playSparkleSound();
                onLaunchDemo();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#ff2d75] to-[#7c3aed] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Full Screen Interactive Demo</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Back to Creator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
