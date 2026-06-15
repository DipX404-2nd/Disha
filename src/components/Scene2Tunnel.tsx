import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles, Heart } from 'lucide-react';
import { SavedPhoto } from '../utils/db';
import { playChimeTrail } from '../utils/audio';

interface Scene2TunnelProps {
  photos: SavedPhoto[];
  onNext: () => void;
  onPrev: () => void;
}

export const Scene2Tunnel: React.FC<Scene2TunnelProps> = ({ photos, onNext, onPrev }) => {
  const [index, setIndex] = useState(0);

  const poeticCaptions = [
    "A radiant soul whose laughter brings light to every room...",
    "Tracing beautiful pathways woven with grace and happiness...",
    "A pure heart of gold, bringing warmth to everyone you know...",
    "Cherishing every singular dream you carry inside your heart...",
    "Celebrating the beautiful person you are, inside and out...",
    "May your days always be painted in the softest rose gold hues..."
  ];

  const getCaption = (idx: number) => {
    return poeticCaptions[idx % poeticCaptions.length];
  };

  useEffect(() => {
    // Sound chime when entering scene
    playChimeTrail();
  }, []);

  const handleNextSlide = () => {
    playChimeTrail();
    if (index === photos.length - 1) {
      onNext();
    } else {
      setIndex(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    playChimeTrail();
    if (index === 0) {
      onPrev();
    } else {
      setIndex(prev => prev - 1);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden z-20 w-full">
      {/* Absolute luxury background frame */}
      <div className="absolute top-10 left-10 font-mono text-[10px] tracking-[0.3em] text-gray-500">
        JOURNEY STEP II / VII • MEMORY TUNNEL
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center relative">
        <div className="mb-8 select-none text-center">
          <h2 className="font-display text-3xl sm:text-5xl text-white tracking-wide mb-2 inline-flex items-center gap-2">
            The Memory Tunnel <Sparkles className="w-6 h-6 text-[#ffd700]" />
          </h2>
          <p className="text-gray-400 font-sans text-xs tracking-wider uppercase font-mono">
            Reliving the gorgeous spectrum of your beautiful moments
          </p>
        </div>

        {/* Outer glass carousel deck */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[480px] rounded-2xl p-4 glass-premium flex items-center justify-center overflow-hidden card-rose-glow">
          <AnimatePresence mode="wait">
            {photos[index] && (
              <motion.div
                key={photos[index].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.85, ease: 'easeInOut' }}
                className="absolute inset-4 rounded-xl overflow-hidden group select-none"
              >
                {/* Image Ken Burns zoom effect */}
                <motion.img
                  animate={{ scale: [1.02, 1.08] }}
                  transition={{ duration: 8, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse' }}
                  src={photos[index].dataUrl}
                  alt={photos[index].name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />

                {/* Internal gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35 flex flex-col justify-between p-6" />

                <div className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono tracking-widest text-[#f3cbd1]">
                  <Heart className="w-4 h-4 fill-[#b76e79] text-[#b76e79] animate-pulse" />
                  <span>MEMORIES IN LIGHT • {index + 1} / {photos.length}</span>
                </div>

                {/* Caption text fading-in beautifully */}
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="font-display text-lg sm:text-2xl text-white italic tracking-wide leading-relaxed font-normal shadow-sm max-w-xl"
                  >
                    "{getCaption(index)}"
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav Controls overlay */}
          <button
            id="tunnel-prev-btn"
            onClick={handlePrevSlide}
            className="absolute left-6 w-11 h-11 rounded-full glass shadow hover:bg-[rgba(183,110,121,0.2)] text-white flex items-center justify-center transition cursor-pointer hover:border-[#b76e79] group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 duration-200" />
          </button>
          
          <button
            id="tunnel-next-btn"
            onClick={handleNextSlide}
            className="absolute right-6 w-11 h-11 rounded-full glass shadow hover:bg-[rgba(183,110,121,0.2)] text-white flex items-center justify-center transition cursor-pointer hover:border-[#b76e79] group"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 duration-200" />
          </button>
        </div>

        {/* Step dots for indicators */}
        <div id="tunnel-index-indicators" className="flex gap-2.5 mt-6">
          {photos.map((_, i) => (
            <button
              id={`tunnel-indicator-dot-${i}`}
              key={i}
              onClick={() => {
                playChimeTrail();
                setIndex(i);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === index ? 'w-8 bg-[#b76e79]' : 'w-2.5 bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step Trigger Controls */}
        <div className="flex gap-4 mt-8">
          <button
            id="tunnel-back-scene-btn"
            onClick={onPrev}
            className="py-2.5 px-6 rounded-full glass hover:bg-slate-900 border border-[rgba(255,255,255,0.06)] text-gray-400 font-sans text-xs tracking-[0.150em] uppercase transition cursor-pointer select-none"
          >
            Back
          </button>
          <button
            id="tunnel-next-scene-btn"
            onClick={onNext}
            className="py-2.5 px-6 rounded-full bg-gradient-to-r from-[#b76e79] to-[#c2818c] text-white font-sans text-xs tracking-[0.150em] font-semibold uppercase transition hover:brightness-110 cursor-pointer shadow shadow-[#b76e79]/20 select-none"
          >
            Enter Gallery
          </button>
        </div>
      </div>
    </div>
  );
};
