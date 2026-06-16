import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { SavedPhoto } from '../utils/db';
import { playDreamyChord } from '../utils/audio';

interface Scene1OpeningProps {
  photos: SavedPhoto[];
  onNext: () => void;
  celebrantName: string;
}

export const Scene1Opening: React.FC<Scene1OpeningProps> = ({ photos, onNext, celebrantName }) => {
  const heroPhoto = photos[0]?.dataUrl;

  const handleBegin = () => {
    playDreamyChord();
    onNext();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden z-10 w-full">
      {/* Blurred romantic background photo frame */}
      {heroPhoto && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#050510]/80 z-10" />
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.0, opacity: 0.35 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            src={heroPhoto}
            alt={`${celebrantName} background`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover blur-md scale-[1.05]"
          />
        </div>
      )}

      {/* Outer framing borders for premium editorial feel */}
      <div className="absolute inset-8 border border-[rgba(183,110,121,0.12)] pointer-events-none rounded-2xl z-20">
        <div className="absolute top-4 left-4 text-[10px] font-mono tracking-[0.2em] text-[#b76e79]/65">
          BESPOKE DIGITAL PORTAL
        </div>
        <div className="absolute bottom-4 right-4 text-[10px] font-mono tracking-[0.2em] text-[#b76e79]/65">
          EST. {new Date().getFullYear()}
        </div>
      </div>

      <div className="relative z-20 max-w-2xl px-4 flex flex-col items-center">
        {/* Floating circular avatar frame with glass layers */}
        {heroPhoto && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, type: 'spring', damping: 20 }}
            className="mb-8 relative"
          >
            {/* Soft pulsing halo rings */}
            <div className="absolute inset-0 rounded-full bg-[#b76e79]/15 blur-xl animate-pulse scale-110" />
            <div className="absolute inset-0 rounded-full border-2 border-[#b76e79]/20 animate-ping opacity-30 scale-105 duration-3000" />
            
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2.5 glass-premium relative border-2 border-[#b76e79]/30">
              <div className="w-full h-full rounded-full overflow-hidden border border-[rgba(255,255,255,0.15)] shadow-inner">
                <img
                  src={heroPhoto}
                  alt={`${celebrantName} Portrait`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover cursor-default hover:scale-110 duration-1000 transition-transform"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Happy Birthday Title with gradient shine */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.0, ease: 'easeOut' }}
        >
          <span className="font-mono text-xs tracking-[0.4em] text-[#ffd700] uppercase block mb-4 gold-glow">
            ✨ PREPARING THE SANCTUARY ✨
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 select-none leading-none">
            Happy Birthday <br />
            <span className="animate-gradient-text rose-glow relative inline-block mt-1">
              {celebrantName}
            </span>
          </h1>
        </motion.div>

        {/* Emotion subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 1.0, duration: 1.2 }}
          className="text-gray-300 font-sans text-base sm:text-lg leading-relaxed max-w-md mb-10 select-none text-center"
        >
          "Today is all about celebrating your smile, your happiness, and the beautiful person you are."
        </motion.p>

        {/* Beautiful luxury triggers button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            id="begin-journey-btn"
            onClick={handleBegin}
            className="relative px-8 py-4 bg-gradient-to-r from-[#b76e79] via-[#c2818c] to-[#b76e79] rounded-full text-white font-sans text-xs tracking-[0.25em] font-semibold uppercase pointer-events-auto hover:brightness-110 transition duration-300 cursor-pointer shadow-lg shadow-[#b76e79]/30 flex items-center gap-3 select-none"
          >
            <Sparkles className="w-4 h-4 text-[#ffd700]" />
            Begin the Journey
            <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
          </button>
        </motion.div>
      </div>

      {/* Atmospheric indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-[10px] tracking-widest font-mono">
        <span>SCROLL OR CLICK TO STEP</span>
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#b76e79]/50 to-transparent animate-bounce mt-1" />
      </div>
    </div>
  );
};
