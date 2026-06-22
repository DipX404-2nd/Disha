import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, Sparkles, Heart, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { SavedPhoto } from '../utils/db';
import { playChimeTrail } from '../utils/audio';

interface Scene3GalleryProps {
  photos: SavedPhoto[];
  onNext: () => void;
  onPrev: () => void;
  onParticleTrigger: () => void; // call parent particle system to trigger hearts
  celebrantName?: string;
}

export const Scene3Gallery: React.FC<Scene3GalleryProps> = ({
  photos,
  onNext,
  onPrev,
  onParticleTrigger
}) => {
  const [activePhoto, setActivePhoto] = useState<SavedPhoto | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleOpenLightbox = (p: SavedPhoto) => {
    playChimeTrail();
    setActivePhoto(p);
    setZoomLevel(1);
  };

  const handleCloseLightbox = () => {
    setActivePhoto(null);
  };

  const handleNextPhoto = () => {
    if (!activePhoto) return;
    const currentIdx = photos.findIndex((p) => p.id === activePhoto.id);
    const nextIdx = (currentIdx + 1) % photos.length;
    setActivePhoto(photos[nextIdx]);
    setZoomLevel(1);
    playChimeTrail();
  };

  const handlePrevPhoto = () => {
    if (!activePhoto) return;
    const currentIdx = photos.findIndex((p) => p.id === activePhoto.id);
    const prevIdx = (currentIdx - 1 + photos.length) % photos.length;
    setActivePhoto(photos[prevIdx]);
    setZoomLevel(1);
    playChimeTrail();
  };

  const likePhoto = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Increase local counter
    setLikes((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1
    }));
    // Spark canvas floating elements
    onParticleTrigger();
    onParticleTrigger(); // double heart trigger!
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center p-6 text-center select-none overflow-hidden z-20 w-full pt-20">
      {/* Absolute luxury background frame */}
      <div className="absolute top-10 left-10 font-mono text-[10px] tracking-[0.3em] text-gray-500">
        JOURNEY STEP III / VII • BESPOKE GALLERY
      </div>

      <div className="max-w-5xl w-full mx-auto relative">
        <div className="text-center mb-10 select-none">
          <span className="font-mono text-xs tracking-widest text-[#b76e79] uppercase block mb-2 font-semibold">
            ✨ STARRY CURATION ✨
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-3">
            Bespoke Portrait Archive
          </h2>
          <p className="text-gray-400 font-sans text-sm max-w-lg mx-auto leading-relaxed">
            Every smile is a galaxy of warmth. Hover on her photographs to illuminate them or touch to expand their stories in full visual glory.
          </p>
        </div>

        {/* Elegant Masonry layout utilizing Tailwind column classes */}
        <div id="luxury-masonry-container" className="columns-1 sm:columns-2 md:columns-3 gap-5 space-y-5 p-1 pb-10">
          {photos.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (idx % 3) * 0.15, duration: 0.8 }}
              onClick={() => handleOpenLightbox(p)}
              className="break-inside-avoid relative rounded-xl overflow-hidden glass hover:border-[rgba(183,110,121,0.5)] transition-all duration-500 cursor-pointer group flex flex-col p-2.5 shadow-lg max-w-full"
            >
              {/* Media Container */}
              <div className="relative rounded-lg overflow-hidden w-full aspect-auto">
                <img
                  src={p.dataUrl}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full object-cover group-hover:scale-[1.04] transition-all duration-1000 ease-out rounded-lg"
                />

                {/* Cover Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] font-mono tracking-wider text-rose-300">
                      MOMENT {idx + 1}
                    </span>
                    <button
                      id={`gallery-like-overlay-${p.id}`}
                      onClick={(e) => likePhoto(p.id, e)}
                      className="w-8 h-8 rounded-full glass flex items-center justify-center text-[#f3cbd1] hover:bg-rose-500/25 transition cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-300 fill-rose-300/40" />
                    </button>
                  </div>
                </div>

                {/* Expand visual icon top corner */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Text metadata */}
              <div className="mt-3 flex justify-between items-center px-1 text-left select-none">
                <div>
                  <h4 className="font-sans font-medium text-xs text-slate-200">
                    {p.name.replace(/\.[^/.]+$/, "")}
                  </h4>
                  <p className="text-[10px] font-mono text-gray-500 tracking-wide">
                    {likes[p.id] ? `❤️ ${likes[p.id]} Heartbeats` : 'Love Curation'}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#b76e79] font-medium tracking-widest bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                  {idx + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Nav triggers */}
        <div className="flex gap-4 justify-center items-center mt-6 select-none pb-12">
          <button
            id="gallery-back-scene-btn"
            onClick={onPrev}
            className="py-2.5 px-6 rounded-full glass hover:bg-slate-900 border border-[rgba(255,255,255,0.06)] text-gray-400 font-sans text-xs tracking-[0.150em] uppercase transition cursor-pointer"
          >
            Back
          </button>
          <button
            id="gallery-next-scene-btn"
            onClick={onNext}
            className="py-2.5 px-6 rounded-full bg-gradient-to-r from-[#b76e79] to-[#c2818c] text-white font-sans text-xs tracking-[0.150em] font-semibold uppercase transition hover:brightness-110 cursor-pointer shadow shadow-[#b76e79]/20"
          >
            Read Greeting Card
          </button>
        </div>
      </div>

      {/* Cinematic Fullscreen Lightbox Dialogue */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            {/* Header toolbar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
              <span className="text-xs font-mono tracking-widest text-gray-400">
                DISHA'S MEMORIES • ARCHIVE LENS
              </span>
              <div className="flex items-center gap-4">
                <button
                  id="lightbox-zoom-in-btn"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  id="lightbox-zoom-out-btn"
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  id="lightbox-close-btn"
                  onClick={handleCloseLightbox}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-rose-400 hover:text-rose-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Lightbox Body Frame */}
            <div className="relative w-full max-w-4xl flex items-center justify-center aspect-[16/10] px-12">
              <button
                id="lightbox-prev-btn"
                onClick={handlePrevPhoto}
                className="absolute left-4 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-slate-900 duration-200 transition cursor-pointer"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Photo Display Frame */}
              <div className="relative overflow-hidden w-full h-full flex items-center justify-center rounded-2xl max-h-[80vh]">
                <motion.img
                  key={activePhoto.id}
                  src={activePhoto.dataUrl}
                  alt={activePhoto.name}
                  referrerPolicy="no-referrer"
                  style={{ scale: zoomLevel }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl transition-all duration-200"
                />

                {/* Center Like Trigger Flare */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button
                    id="lightbox-sparkle-btn"
                    onClick={(e) => likePhoto(activePhoto.id, e)}
                    className="relative px-5 py-2 glass hover:bg-rose-500/20 text-xs font-mono font-semibold text-rose-300 rounded-full border border-rose-500/30 flex items-center gap-2 transition cursor-pointer hover:scale-105 duration-200"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
                    <span>TAP TO SPARK HEARTS</span>
                    <span className="font-bold text-red-200">
                      ({likes[activePhoto.id] || 0})
                    </span>
                  </button>
                </div>
              </div>

              <button
                id="lightbox-next-btn"
                onClick={handleNextPhoto}
                className="absolute right-4 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-slate-900 duration-200 transition cursor-pointer"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>
            
            {/* Informative Footer */}
            <div className="mt-4 text-center select-none z-50">
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">
                TIP: Pinch or use zoom icons in the top right to scale photo. Click background or [x] to exit.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
