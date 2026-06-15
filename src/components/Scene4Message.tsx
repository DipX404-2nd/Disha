import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, MailOpen } from 'lucide-react';
import { playDreamyChord, playChimeTrail } from '../utils/audio';

interface Scene4MessageProps {
  onNext: () => void;
  onPrev: () => void;
}

export const Scene4Message: React.FC<Scene4MessageProps> = ({ onNext, onPrev }) => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    // Play warm chord when entering card scene
    playDreamyChord();
  }, []);

  const handleOpenLetter = () => {
    setOpened(true);
    playChimeTrail();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden z-20 w-full pt-16">
      {/* Absolute luxury background frame */}
      <div className="absolute top-10 left-10 font-mono text-[10px] tracking-[0.3em] text-gray-500">
        JOURNEY STEP IV / VII • ROYAL ENVELOPE
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center relative z-10 select-none">
        
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-2 inline-flex items-center gap-2">
            A Birthday Message <Sparkles className="w-5 h-5 text-[#ffd700]" />
          </h2>
          <p className="text-gray-400 font-sans text-xs tracking-wider uppercase font-mono">
            An elegant personal note written in light and stars
          </p>
        </div>

        {/* Envelope container */}
        <div className="relative w-full max-w-lg min-h-[350px] flex items-center justify-center">
          {!opened ? (
            // Closed Wax Seal Envelope
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.8 }}
              onClick={handleOpenLetter}
              className="w-full aspect-[16/11] glass-premium rounded-2xl flex flex-col items-center justify-center p-8 border-2 border-[rgba(183,110,121,0.3)] shadow-2xl relative cursor-pointer hover:border-[rgba(183,110,121,0.65)] hover:bg-[rgba(183,110,121,0.04)] duration-300 transition group select-none"
            >
              {/* Envelope flap lines */}
              <div className="absolute inset-0 border-b border-[rgba(183,110,121,0.08)] pointer-events-none rounded-2xl" />
              <div className="absolute top-0 inset-x-0 h-1/2 border-b border-dashed border-[rgba(183,110,121,0.15)] pointer-events-none rounded-t-2xl" />

              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#b76e79] to-[#c2818c] flex items-center justify-center text-[#fbbf24] shadow-md relative z-10 mb-4 group-hover:scale-105 duration-300"
              >
                <MailOpen className="w-8 h-8 text-white fill-white/10" />
                {/* Soft wax seal ripples */}
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-30" />
              </motion.div>

              <h3 className="font-display text-2xl text-white mb-2 font-semibold">
                Bespoke Letter for Disha
              </h3>
              <p className="text-gray-400 text-xs tracking-widest font-mono uppercase mb-6">
                Click Wax Seal to Slide Open
              </p>

              <span className="text-[10px] font-mono tracking-widest text-[#b76e79] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-[#b76e79] animate-pulse" /> FROM THE STARS, WITH LOVE
              </span>
            </motion.div>
          ) : (
            // Opened Letter scroll
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateX: 45 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-full glass-premium rounded-2xl p-8 border border-[rgba(183,110,121,0.45)] relative card-rose-glow select-none"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <Sparkles className="w-4 h-4 text-[#ffd700]" />
              </div>

              {/* Shimmer Border */}
              <div className="absolute inset-2 border border-[rgba(183,110,121,0.12)] rounded-xl pointer-events-none" />

              {/* Handwritten content inside letter card */}
              <div className="cursive-message pt-6 pr-4 pl-4 pb-6 relative z-10 flex flex-col items-center select-text">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 2.0 }}
                  className="font-hand text-3xl sm:text-4xl text-[#f3cbd1] leading-relaxed select-text tracking-wide px-2 rose-glow"
                >
                  "May this year bring endless happiness, beautiful memories, success, laughter, and everything that makes you smile.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 2.0 }}
                  className="font-hand text-2xl sm:text-3xl text-gray-300 mt-5 leading-normal select-text tracking-wide"
                >
                  You deserve all the joy in the world.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 4.5, duration: 2.5 }}
                  className="font-hand text-4xl sm:text-5xl text-[#ffd700] mt-7 block select-text font-bold gold-glow relative inline-flex items-center gap-2"
                >
                  Happy Birthday, Disha <Heart className="w-7 h-7 inline text-[#b76e79] fill-[#b76e79] animate-pulse" />
                </motion.p>
              </div>

              {/* Decorative design flourishes */}
              <div className="mt-4 flex justify-center pb-2 select-none">
                <span className="text-[10px] font-mono tracking-[0.3em] text-[#b76e79]/60">
                  ENGRAVED DIGITAL CHRONICLE
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Global Nav triggers */}
        <div className="flex gap-4 mt-8 select-none">
          <button
            id="message-back-scene-btn"
            onClick={onPrev}
            className="py-2.5 px-6 rounded-full glass hover:bg-slate-900 border border-[rgba(255,255,255,0.06)] text-gray-400 font-sans text-xs tracking-[0.150em] uppercase transition cursor-pointer"
          >
            Back
          </button>
          
          <button
            id="message-next-scene-btn"
            disabled={!opened}
            onClick={onNext}
            className={`py-2.5 px-6 rounded-full font-sans text-xs tracking-[0.150em] font-semibold uppercase transition select-none ${
              opened
                ? 'bg-gradient-to-r from-[#b76e79] to-[#c2818c] text-white hover:brightness-110 cursor-pointer shadow shadow-[#b76e79]/30'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            Light The Cake
          </button>
        </div>
      </div>
    </div>
  );
};
