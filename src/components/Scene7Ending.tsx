import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, RefreshCw, PenTool, Plus } from 'lucide-react';
import { playDreamyChord, playChimeTrail } from '../utils/audio';

interface SavedWish {
  id: string;
  author: string;
  message: string;
  timestamp: number;
}

interface Scene7EndingProps {
  onNext: () => void; // reset or next
  onPrev: () => void;
  onFireworkTrigger: (x?: number, y?: number) => void;
  onBalloonTrigger: () => void;
  onResetPhotos: () => void; // allow re-uploading
  isUserInputEnabled?: boolean;
}

export const Scene7Ending: React.FC<Scene7EndingProps> = ({
  onNext,
  onPrev,
  onFireworkTrigger,
  onBalloonTrigger,
  onResetPhotos,
  isUserInputEnabled = true
}) => {
  const [visitorName, setVisitorName] = useState('');
  const [visitorMessage, setVisitorMessage] = useState('');
  const [savedWishes, setSavedWishes] = useState<SavedWish[]>([]);

  // Load guest registry on mount
  useEffect(() => {
    playDreamyChord();
    const stored = localStorage.getItem('disha_birthday_wishes');
    if (stored) {
      try {
        setSavedWishes(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to read stored wishes:', e);
      }
    }

    // Auto-spawn persistent celebration bursts
    onFireworkTrigger();
    onBalloonTrigger();
    
    const fworkInterval = setInterval(() => {
      onFireworkTrigger(Math.random() * window.innerWidth, window.innerHeight * 0.2 + Math.random() * window.innerHeight * 0.3);
    }, 2800);

    return () => clearInterval(fworkInterval);
  }, []);

  const handleManualFirework = (e: React.MouseEvent) => {
    // Explode firework right where the cursor triggers!
    onFireworkTrigger(e.clientX, e.clientY);
    playChimeTrail();
  };

  const submitRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorMessage.trim()) return;

    const newWish: SavedWish = {
      id: `${Date.now()}`,
      author: visitorName.trim(),
      message: visitorMessage.trim(),
      timestamp: Date.now()
    };

    const updated = [newWish, ...savedWishes];
    setSavedWishes(updated);
    localStorage.setItem('disha_birthday_wishes', JSON.stringify(updated));

    setVisitorName('');
    setVisitorMessage('');
    playChimeTrail();
    onFireworkTrigger(); // spawn a celebrate firework
  };

  const handleClearWishes = () => {
    localStorage.removeItem('disha_birthday_wishes');
    setSavedWishes([]);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-6 text-center select-none overflow-hidden z-20 w-full pt-16 pb-12">
      {/* Absolute luxury background frame */}
      <div className="absolute top-10 left-10 font-mono text-[10px] tracking-[0.3em] text-gray-500">
        JOURNEY STEP VII / VII • GRAND FINALE
      </div>

      <div className="max-w-3xl w-full flex flex-col items-center relative z-10 select-none px-4 pt-6">
        
        {/* Core Ending Dedication Title banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative inline-block mb-4 select-none"
        >
          {/* Pulsing halo background */}
          <div className="absolute inset-0 bg-[#b76e79]/10 blur-2xl animate-pulse scale-110" />
          
          <h1 className="font-display text-4xl sm:text-7xl font-bold tracking-tight text-white mb-2 leading-tight select-none">
            Happy Birthday <br />
            <span className="animate-gradient-text ease-in-out duration-3000 inline-block mt-2 rose-glow select-none">
              Disha ❤️
            </span>
          </h1>
        </motion.div>

        {/* Closing beautiful quotation statement */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 1.0, duration: 1.5 }}
          className="text-[#f3cbd1] font-display text-xl sm:text-2xl italic tracking-wide font-normal max-w-lg mb-12 select-none"
        >
          "May your smile always shine brighter than the stars."
        </motion.p>

        {/* Manual Fireworks launching sandbox trigger */}
        <div className="mb-10 text-center select-none">
          <p className="text-gray-500 text-[10px] tracking-[0.25em] font-mono mb-2 uppercase select-none">
            🚀 SPARK CELEBRATION
          </p>
          <button
            id="click-firework-burst-btn"
            disabled={!isUserInputEnabled}
            onClick={handleManualFirework}
            className="px-6 py-2.5 glass text-[10px] font-mono tracking-widest text-[#ffd700] rounded-full hover:bg-[rgba(251,191,36,0.15)] hover:border-[#fbbf24] transition duration-300 cursor-pointer shadow-lg shadow-yellow-500/5 select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUserInputEnabled ? "💥 CLICK HERE TO SHOOT CUSTOM FIREWORKS" : "💥 CELEBRATION SPARKLERS PAUSED BY ADMIN"}
          </button>
        </div>

        {/* Digital Guest Book / Wishes grid */}
        <div id="ending-guestbook-sec" className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start text-left mb-12">
          
          {/* Registry Sign form */}
          <div className="glass p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] relative select-none">
            <h3 className="font-display text-lg text-white mb-5 flex items-center gap-2 font-semibold">
              <PenTool className="w-4.5 h-4.5 text-[#b76e79]" /> Sign Her Guest Book
            </h3>
            <form onSubmit={submitRegistry} className="space-y-4">
              <div>
                <input
                  id="guestbook-author-input"
                  type="text"
                  required
                  disabled={!isUserInputEnabled}
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder={isUserInputEnabled ? "Your Name" : "Guest registration paused"}
                  className="w-full bg-slate-950/70 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b76e79]/60 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <textarea
                  id="guestbook-message-input"
                  required
                  rows={3}
                  disabled={!isUserInputEnabled}
                  value={visitorMessage}
                  onChange={(e) => setVisitorMessage(e.target.value)}
                  placeholder={isUserInputEnabled ? "Write a sweet birthday wish for Disha..." : "Sign-ups currently restricted by site administrator."}
                  className="w-full bg-slate-950/70 border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b76e79]/60 font-sans resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                id="guestbook-submit-btn"
                type="submit"
                disabled={!isUserInputEnabled}
                className="w-full py-3 bg-gradient-to-r from-[#b76e79] to-[#c2818c] text-white rounded-xl font-sans text-xs font-semibold tracking-widest uppercase hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 shadow shadow-[#b76e79]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Save Wish to Register
              </button>
            </form>
          </div>

          {/* Registry List show box */}
          <div className="flex flex-col h-[264px] relative">
            <div className="flex justify-between items-center mb-4 select-none">
              <h3 className="font-mono text-xs tracking-wider text-gray-400">
                LIFETIME WISH REGISTER ({savedWishes.length})
              </h3>
              {savedWishes.length > 0 && (
                <button
                  id="clear-registry-btn"
                  onClick={handleClearWishes}
                  className="text-[10px] text-red-400/65 hover:text-red-400 font-sans cursor-pointer transition"
                >
                  Clear Register
                </button>
              )}
            </div>

            <div id="wishes-display-feed" className="flex-1 overflow-y-auto space-y-3.5 pr-2.5 no-scrollbar select-text">
              <AnimatePresence>
                {savedWishes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-2xl select-none">
                    <Heart className="w-6 h-6 text-slate-700 mb-2 fill-neutral-800" />
                    <span className="text-gray-500 text-xs font-sans">No wishes found. Be the first to draft a beautiful lifetime memory!</span>
                  </div>
                ) : (
                  savedWishes.map((w) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass p-4 rounded-xl border-l-2 border-[#b76e79] shadow-sm select-text"
                    >
                      <p className="text-xs text-gray-200 select-text leading-relaxed font-sans font-normal italic mb-2.5">
                        "{w.message}"
                      </p>
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[10px] font-mono tracking-wide text-[#f3cbd1]">
                          — {w.author}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">
                          {new Date(w.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Global Control Bar Bottom resets */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center select-none pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <button
            id="ending-back-btn"
            onClick={onPrev}
            className="py-2.5 px-6 rounded-full glass hover:bg-slate-900 border border-[rgba(255,255,255,0.06)] text-gray-400 font-sans text-xs tracking-[0.150em] uppercase transition cursor-pointer select-none"
          >
            Back to Sky
          </button>
          
          <button
            id="ending-reset-experience-btn"
            onClick={onNext}
            className="py-2.5 px-6 rounded-full glass hover:bg-slate-900 border border-[rgba(183,110,121,0.25)] text-[#f3cbd1] font-sans text-xs tracking-[0.150em] uppercase transition cursor-pointer flex items-center justify-center gap-2 select-none hover:border-[#b76e79]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart Journey
          </button>

          <button
            id="ending-change-photos-btn"
            onClick={onResetPhotos}
            className="py-2.5 px-6 rounded-full bg-slate-950/80 text-gray-400 border border-red-500/15 text-xs font-sans tracking-[0.150em] uppercase transition duration-300 hover:text-white hover:border-red-400/40 cursor-pointer select-none"
          >
            Re-Upload Photos 📸
          </button>
        </div>

      </div>
    </div>
  );
};
