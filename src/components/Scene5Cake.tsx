import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Gift } from 'lucide-react';
import { playCelebrantFanfare, playMatchStrike } from '../utils/audio';

interface Scene5CakeProps {
  onNext: () => void;
  onPrev: () => void;
  onConfettiTrigger: () => void; // Trigger full confetti bursts
  onBalloonTrigger: () => void;  // Launch balloons
  celebrantName: string;
}

export const Scene5Cake: React.FC<Scene5CakeProps> = ({
  onNext,
  onPrev,
  onConfettiTrigger,
  onBalloonTrigger,
  celebrantName
}) => {
  const [candles, setCandles] = useState<boolean[]>([false, false, false, false, false]);
  const [phase, setPhase] = useState<'lighting' | 'wish' | 'cut' | 'cutCompleted'>('lighting');
  const [isWavering, setIsWavering] = useState(false);

  const lightCandle = (idx: number) => {
    if (candles[idx]) return;
    playMatchStrike();
    setCandles((prev) => {
      const updated = [...prev];
      updated[idx] = true;
      return updated;
    });
  };

  const allCandlesLit = candles.every((c) => c);

  const startMakeAWish = () => {
    setPhase('wish');
    playMatchStrike();
    // Simulate minor ambient wavering
    setIsWavering(true);
  };

  const handleCutCake = () => {
    setPhase('cutCompleted');
    playCelebrantFanfare();
    // Blow out candles
    setCandles([false, false, false, false, false]);
    // Trigger canvas bursts multiple times for a massive emotional impact!
    onConfettiTrigger();
    onBalloonTrigger();
    onBalloonTrigger();
    
    // Stagger a secondary blast!
    setTimeout(() => {
      onConfettiTrigger();
    }, 400);
    setTimeout(() => {
      onConfettiTrigger();
    }, 850);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden z-20 w-full pt-16">
      {/* Absolute luxury background frame */}
      <div className="absolute top-10 left-10 font-mono text-[10px] tracking-[0.3em] text-gray-500">
        JOURNEY STEP V / VII • CELEBRATION CAKE
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center relative z-10 select-none">
        
        <div className="text-center mb-8">
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-2 inline-flex items-center gap-2">
            Interactive Birthday Cake <Sparkles className="w-5 h-5 text-[#ffd700]" />
          </h2>
          <p className="text-gray-400 font-sans text-xs tracking-wider uppercase font-mono">
            Light her candles, whisper a wish, and cut her royal cake
          </p>
        </div>

        {/* Phase-specific helper text prompts */}
        <div className="mb-6 h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'lighting' && (
              <motion.p
                key="lighting-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[#f3cbd1] text-sm tracking-wide"
              >
                {!allCandlesLit
                  ? `👉 Please click each of the 5 candles below to light them (${candles.filter((c) => c).length}/5)`
                  : '✨ Marvelous! All candles are sparkling. Ready to make a wish?'}
              </motion.p>
            )}
            {phase === 'wish' && (
              <motion.p
                key="wish-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-amber-300 text-sm tracking-wide"
              >
                🕯️ Make a silent wish inside your heart for {celebrantName}, then click "Cut the Cake" below!
              </motion.p>
            )}
            {phase === 'cutCompleted' && (
              <motion.p
                key="complete-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 1 }}
                className="text-emerald-400 text-sm tracking-wide font-semibold inline-flex items-center gap-2"
              >
                🎉 Hurray! Happy Birthday {celebrantName}! The skies are fully celebrating you! ❤️
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Realistic luxury SVG Cake Stage */}
        <div className="relative w-80 h-96 flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-radial-gradient from-[rgba(183,110,121,0.06)] to-transparent rounded-full blur-3xl scale-125" />

          {/* Sparkles hovering cake */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none">
            <div className="absolute top-4 left-6 w-1 h-1 bg-[#ffd700] rounded-full animate-ping delay-75" />
            <div className="absolute top-12 right-12 w-2 h-2 bg-[#b76e79] rounded-full animate-ping delay-500" />
            <div className="absolute bottom-24 left-10 w-1.5 h-1.5 bg-[#ffd700] rounded-full animate-ping delay-1000" />
          </div>

          <div className="absolute bottom-10 w-full flex flex-col items-center">
            
            {/* 1. CANDLES STACK */}
            <div className="flex gap-5 justify-center items-end h-28 mb-[-4px] relative z-30 select-none">
              {candles.map((isLit, idx) => (
                <div
                  key={idx}
                  onClick={() => lightCandle(idx)}
                  className="flex flex-col items-center cursor-pointer transition relative h-full justify-end group"
                  style={{ transform: `translateY(${Math.abs(idx - 2) * 5}px)` }}
                >
                  {/* Flicker flame overlay */}
                  <AnimatePresence>
                    {isLit && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="flame mb-1"
                      />
                    )}
                  </AnimatePresence>

                  {/* Candle candle wax structure */}
                  <div
                    className={`w-3.5 h-16 rounded-t-sm transition-all duration-300 relative ${
                      isLit
                        ? 'bg-gradient-to-t from-pink-400 via-yellow-200 to-white shadow-lg'
                        : 'bg-gradient-to-t from-[#b76e79] via-[#c2818c] to-[#f3cbd1] border border-white/5'
                    }`}
                  >
                    {/* Woven spiral decor */}
                    <div className="absolute inset-x-0 h-full bg-repeating-linear-gradient opacity-30 cursor-pointer" />
                  </div>
                  
                  {/* Burn indicator wick tip */}
                  <div className="w-0.5 h-2 bg-neutral-700 mx-auto" />
                </div>
              ))}
            </div>

            {/* 2. THREE-STAGE MULTI-TIER ROYAL CAKE */}
            <div className="w-64 flex flex-col items-center relative z-20">
              
              {/* TOP TIER (Rose Gold Frosting) */}
              <motion.div
                animate={phase === 'cutCompleted' ? { y: -10, rotate: 1 } : {}}
                transition={{ type: 'spring' }}
                className="w-44 h-16 bg-gradient-to-r from-[#b76e79] via-[#d59ea6] to-[#b76e79] rounded-t-xl relative border-t border-white/20 shadow-md flex items-center justify-center p-1"
              >
                {/* Drip white icing drips */}
                <div className="absolute bottom-0 inset-x-0 h-4 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 20%22 preserveAspectRatio=%22none%22><path d=%22M0,0 Q10,10 20,0 T40,0 T60,0 T80,0 T100,0 L100,20 L0,20 Z%22 fill=%22%23f3cbd1%22 opacity=%220.85%22/></svg>')] bg-repeat-x scale-y-[-1] pointer-events-none" />
                
                {/* "Disha" plate */}
                <span className="font-hand text-2xl text-white drop-shadow select-none">
                  {celebrantName}
                </span>
              </motion.div>

              {/* SECOND TIER (Cream Velvet Frosting) */}
              <motion.div
                animate={phase === 'cutCompleted' ? { y: 2, rotate: -0.5 } : {}}
                className="w-56 h-20 bg-gradient-to-r from-neutral-100 via-pink-100 to-neutral-200 rounded-lg relative border-y border-[rgba(183,110,121,0.2)] shadow-md mt-[-2px]"
              >
                {/* Draping rose gold decorative visual pearls */}
                <div className="absolute top-2 inset-x-4 flex justify-around">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#b76e79] shadow opacity-75" />
                  ))}
                </div>
              </motion.div>

              {/* BASE PLATTER (Golden Pillar base) */}
              <div className="w-64 h-6 bg-gradient-to-r from-amber-600 via-yellow-200 to-amber-700 rounded-full border border-yellow-300/30 relative z-10 shadow-xl flex items-center justify-center">
                <div className="w-60 h-2 bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full blur-sm opacity-50" />
              </div>
            </div>

          </div>
        </div>

        {/* Phase Action Buttons */}
        <div className="flex gap-4 select-none mb-6">
          <AnimatePresence mode="wait">
            {phase === 'lighting' && (
              <motion.button
                id="make-wish-stage-btn"
                key="wish-btn"
                disabled={!allCandlesLit}
                onClick={startMakeAWish}
                className={`py-3.5 px-8 rounded-full font-sans text-xs tracking-[0.2em] font-bold uppercase transition duration-300 flex items-center gap-2 select-none ${
                  allCandlesLit
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/30 font-bold hover:scale-105'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700/50'
                }`}
              >
                <Gift className="w-4 h-4 animate-bounce" />
                Make a Wish ✨
              </motion.button>
            )}
            
            {phase === 'wish' && (
              <motion.button
                id="cut-cake-stage-btn"
                key="cut-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleCutCake}
                className="py-3.5 px-8 rounded-full bg-gradient-to-r from-pink-500 to-[#b76e79] text-white font-sans text-xs tracking-[0.2em] font-bold uppercase hover:scale-105 hover:brightness-110 transition cursor-pointer shadow-lg shadow-pink-500/20 flex items-center gap-2 select-none"
              >
                <Heart className="w-4 h-4 fill-white" />
                Cut the Cake 🍰
              </motion.button>
            )}

            {phase === 'cutCompleted' && (
              <motion.button
                id="enter-skies-stage-btn"
                key="ending-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onNext}
                className="py-3.5 px-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-sans text-xs tracking-[0.2em] font-bold uppercase hover:scale-105 duration-300 transition cursor-pointer shadow-lg shadow-emerald-500/20 select-none"
              >
                Behold the Cosmic Skies 🌌
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation triggers */}
        <div className="flex gap-4 select-none mt-2">
          <button
            id="cake-back-scene-btn"
            onClick={onPrev}
            className="py-2 px-5 rounded-full glass hover:bg-slate-900 border border-[rgba(255,255,255,0.06)] text-gray-400 font-sans text-[10px] tracking-[0.150em] uppercase transition cursor-pointer"
          >
            Back to Card
          </button>
        </div>
      </div>
    </div>
  );
};
