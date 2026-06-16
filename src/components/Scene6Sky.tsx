import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, Heart } from 'lucide-react';
import { SavedPhoto } from '../utils/db';
import { playDreamyChord, playChimeTrail } from '../utils/audio';

interface Scene6SkyProps {
  photos: SavedPhoto[];
  onNext: () => void;
  onPrev: () => void;
  onLanternTrigger: (x: number) => void; // spawn rising lanterns dynamically
  isUserInputEnabled?: boolean;
}

export const Scene6Sky: React.FC<Scene6SkyProps> = ({
  photos,
  onNext,
  onPrev,
  onLanternTrigger,
  isUserInputEnabled = true
}) => {
  const [wishText, setWishText] = useState('');
  const [activeWishes, setActiveWishes] = useState<string[]>([]);
  const blendPhoto = photos[1]?.dataUrl || photos[0]?.dataUrl;

  useEffect(() => {
    playDreamyChord();
  }, []);

  const handleReleaseLantern = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!wishText.trim()) return;

    // Trigger local animation & canvas lanterns
    setActiveWishes((prev) => [...prev, wishText]);
    setWishText('');
    playChimeTrail();

    // Trigger rising lantern at random horizontal coordinate
    const randomX = Math.random() * (window.innerWidth - 200) + 100;
    onLanternTrigger(randomX);

    // Stagger an extra small sparkler
    setTimeout(() => {
      onLanternTrigger(randomX + 50);
    }, 300);
  };

  const handleDirectSkyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isUserInputEnabled) return;
    // Spawn lantern exactly where userClicked horizontally!
    if ((e.target as HTMLElement).id === 'sky-touch-canvas-overlay') {
      onLanternTrigger(e.clientX);
      playChimeTrail();
    }
  };

  return (
    <div
      onClick={handleDirectSkyClick}
      id="sky-touch-canvas-overlay"
      className="relative min-h-screen flex flex-col items-center justify-between p-6 text-center select-none overflow-hidden z-20 w-full pt-16 cursor-crosshair pb-12"
    >
      {/* 1. PORTRAIT BLENDED CONSTELATION VIGNETTE */}
      {blendPhoto && (
        <div id="constellation-vignette" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vh] h-[70vh] rounded-full pointer-events-none z-0 overflow-hidden opacity-25">
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050510]/50 to-[#050510] z-10" />
          <motion.img
            animate={{ scale: [1.0, 1.15, 1.0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            src={blendPhoto}
            alt="Blended Disha Silhouette"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full mix-blend-color-dodge blur-sm"
          />
        </div>
      )}

      {/* Absolute luxury background frame labels */}
      <div className="absolute top-10 left-10 font-mono text-[10px] tracking-[0.3em] text-gray-500 pointer-events-none">
        JOURNEY STEP VI / VII • COSMIC SKY
      </div>

      {/* Title section */}
      <div className="relative z-10 max-w-xl pointer-events-none mt-4 select-none">
        <span className="font-mono text-xs tracking-widest text-[#ffd700] uppercase block mb-2 gold-glow">
          ✨ THE CELESTIAL CANALS ✨
        </span>
        <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-3">
          Dream Sky Celebration
        </h2>
        <p className="text-gray-400 font-sans text-sm leading-relaxed max-w-md mx-auto">
          The entire sky celebrates Disha. Write your sweet dreams or click the night sky to release glowing digital lanterns.
        </p>
      </div>

      {/* Rising wishes overlay displays */}
      <div className="absolute inset-x-8 top-1/4 h-2/5 pointer-events-none overflow-hidden flex flex-col items-center">
        {activeWishes.map((w, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 150, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -250, scale: [0.8, 1, 1.1, 0.9] }}
            transition={{ duration: 7.5, ease: 'easeOut' }}
            className="absolute bg-amber-500/10 border border-amber-400/25 px-4 py-1.5 rounded-full text-[#ffd700] text-xs font-mono tracking-wider shadow shadow-amber-500/15"
            style={{
              left: `${(idx * 73) % 65 + 15}%`,
              animationDelay: `${idx * 0.1}s`
            }}
          >
            🎈 {w}
          </motion.div>
        ))}
      </div>

      {/* Form & Controls Card bottom */}
      <div className="relative z-10 max-w-md w-full glass p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-xl mt-8">
        <form onSubmit={handleReleaseLantern} className="flex gap-2.5 items-center w-full">
          <input
            id="wish-lantern-input"
            type="text"
            disabled={!isUserInputEnabled}
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            placeholder={isUserInputEnabled ? "Type a wish for Disha..." : "Admin has paused wish typing..."}
            maxLength={60}
            className="flex-1 bg-slate-950/70 border border-[rgba(183,110,121,0.25)] rounded-full px-5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b76e79] font-sans pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            id="send-wish-lantern-btn"
            type="submit"
            disabled={!isUserInputEnabled}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#b76e79] to-[#c2818c] text-white flex items-center justify-center transition hover:scale-105 pointer-events-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>

        {/* Global Navigation controls */}
        <div className="flex gap-4 items-center justify-between mt-5 pt-3 border-t border-[rgba(255,255,255,0.05)] select-none">
          <button
            id="sky-back-scene-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="py-1.5 px-4 rounded-full glass hover:bg-slate-900 border border-[rgba(255,255,255,0.06)] text-gray-400 font-sans text-[10px] tracking-wider uppercase transition pointer-events-auto cursor-pointer"
          >
            Back
          </button>

          <span className="text-[9px] font-mono tracking-widest text-[#ffd700] uppercase animate-pulse">
            ✨ CLICK SKY TO RELEASE ✨
          </span>

          <button
            id="sky-next-scene-btn"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="py-1.5 px-4 rounded-full bg-gradient-to-r from-[#b76e79] to-[#c2818c] text-white font-sans text-[10px] tracking-wider font-semibold uppercase transition hover:brightness-110 pointer-events-auto cursor-pointer shadow-md"
          >
            Golden Ending
          </button>
        </div>
      </div>
    </div>
  );
};
