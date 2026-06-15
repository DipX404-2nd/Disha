import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedPhoto, savePhoto } from '../utils/db';

interface MemoryUploaderProps {
  onUploadComplete: (photos: SavedPhoto[]) => void;
}

export const MemoryUploader: React.FC<MemoryUploaderProps> = ({ onUploadComplete }) => {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const imageFiles = Array.from(files).filter(file => validImageTypes.includes(file.type));

    if (imageFiles.length === 0) return;

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        const newPhoto: SavedPhoto = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          dataUrl: e.target.result as string,
          timestamp: Date.now() + Math.random() // offset slightly to separate
        };

        setPhotos(prev => {
          const updated = [...prev, newPhoto];
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) return;
    
    // Save all to IndexedDB
    for (const photo of photos) {
      await savePhoto(photo);
    }
    
    onUploadComplete(photos);
  };

  const loadDemoExperience = async () => {
    // Generate gorgeous luxury gradient graphics as elegant default memory slides
    const sampleGradients = [
      'linear-gradient(135deg, #b76e79 0%, #0a0614 100%)',
      'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #1e1b4b 100%)',
      'linear-gradient(135deg, #050510 0%, #b76e79 100%)',
      'linear-gradient(135deg, #371a45 0%, #050510 100%)',
      'linear-gradient(135deg, #0f172a 0%, #b76e79 50%, #0f172a 100%)'
    ];

    const demoPhotos = sampleGradients.map((grad, idx) => {
      // Create a beautiful placeholder canvas with luxury gold birthday letters
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw elegant gradient background
        const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
        if (idx === 0) {
          gradient.addColorStop(0, '#150f24');
          gradient.addColorStop(0.5, '#2e1430');
          gradient.addColorStop(1, '#050510');
        } else if (idx === 1) {
          gradient.addColorStop(0, '#090d22');
          gradient.addColorStop(0.5, '#1b0e2b');
          gradient.addColorStop(1, '#0a0515');
        } else if (idx === 2) {
          gradient.addColorStop(0, '#2e1423');
          gradient.addColorStop(0.5, '#441829');
          gradient.addColorStop(1, '#0f0510');
        } else if (idx === 3) {
          gradient.addColorStop(0, '#0a0c1f');
          gradient.addColorStop(0.5, '#1a1b41');
          gradient.addColorStop(1, '#050510');
        } else {
          gradient.addColorStop(0, '#311224');
          gradient.addColorStop(0.5, '#160d2b');
          gradient.addColorStop(1, '#020205');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 800);

        // Twinkling gold background circles
        for (let j = 0; j < 60; j++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 1200, Math.random() * 800, Math.random() * 4 + 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, ' + (Math.random() * 0.4 + 0.1) + ')';
          ctx.fill();
        }

        // Draw elegant golden circular visual frame
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(600, 400, 250, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(600, 400, 260, 0, Math.PI * 2);
        ctx.stroke();

        // Draw modern celebratory design overlay text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.font = 'normal 15px "Space Grotesk", sans-serif';
        ctx.fillText('✨ A CELEBRATION OF DISHA ✨', 600, 310);

        ctx.fillStyle = '#f3cbd1';
        ctx.font = 'italic 75px "Playfair Display", serif';
        
        const labels = [
          'Unforgettable Smile',
          'Moments of Joy',
          'Radiant Soul',
          'Infinite Dreams',
          'Golden Magic'
        ];
        ctx.fillText(labels[idx], 600, 400);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'normal 12px "Space Grotesk", sans-serif';
        ctx.fillText(`MOMENT ${idx + 1} / 5 • DISHA'S SANCTUARY`, 600, 490);
      }

      return {
        id: `demo-${idx}`,
        name: `Demo Photo ${idx + 1}`,
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        timestamp: Date.now() + idx * 10
      };
    });

    for (const demoPhoto of demoPhotos) {
      await savePhoto(demoPhoto);
    }
    onUploadComplete(demoPhotos);
  };

  return (
    <div id="uploader-container" className="min-h-screen flex items-center justify-center p-6 relative z-10 select-none">
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050510] pointer-events-none" />
      
      {/* Background visual rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[rgba(183,110,121,0.06)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-[rgba(183,110,121,0.03)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="max-w-xl w-full glass-premium p-8 rounded-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 bg-[rgba(183,110,121,0.15)] rounded-full flex items-center justify-center border border-[rgba(183,110,121,0.3)] ripple"
          >
            <Sparkles className="w-8 h-8 text-[#b76e79] rose-glow" />
          </motion.div>
          <h1 className="font-display text-4xl text-white tracking-wide mb-3">
            Disha’s Birthday Journey
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto lead-relaxed font-sans">
            To craft a bespoke luxury digital gift for Disha, upload her beautiful photos. They will be processed securely on your device.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          id="photo-dropzone"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-[#b76e79] bg-[rgba(183,110,121,0.12)] scale-[1.02]'
              : 'border-[rgba(255,255,255,0.15)] bg-slate-950/25 hover:border-[rgba(183,110,121,0.5)] hover:bg-[rgba(183,110,121,0.03)]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
          <Upload className="w-10 h-10 text-gray-500 mb-3" />
          <p className="font-semibold text-gray-300 text-sm text-center mb-1">
            Drag & drop Disha’s photos here
          </p>
          <p className="text-xs text-gray-500">
            or click to browse from device (JPEG, PNG, WebP)
          </p>
        </div>

        {/* Selected Photos List */}
        <AnimatePresence>
          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono text-gray-400 tracking-wider">
                  MEMORIES IMPORTED ({photos.length})
                </span>
                <button
                  id="clear-all-upload-btn"
                  onClick={() => setPhotos([])}
                  className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1 cursor-pointer font-sans"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              {/* Grid preview of images */}
              <div id="imported-thumbnails-grid" className="grid grid-cols-4 gap-3 max-h-36 overflow-y-auto no-scrollbar p-1">
                {photos.map((p) => (
                  <motion.div
                    key={p.id}
                    layoutId={p.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square group rounded-md overflow-hidden border border-[rgba(255,255,255,0.08)] bg-slate-900"
                  >
                    <img
                      src={p.dataUrl}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      id={`remove-photo-btn-${p.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(p.id);
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 text-red-400 hover:scale-110 duration-200" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            id="start-demo-btn"
            onClick={loadDemoExperience}
            className="flex-1 py-3 px-4 rounded-lg bg-slate-950/40 hover:bg-slate-900/60 border border-[rgba(255,255,255,0.1)] text-gray-300 font-sans tracking-wide text-xs transition duration-300 cursor-pointer text-center select-none"
          >
            Explore with Sample Art ✨
          </button>
          <button
            id="start-personal-journey-btn"
            disabled={photos.length === 0}
            onClick={handleSubmit}
            className={`flex-1 py-3 px-4 rounded-lg font-sans font-medium tracking-wide text-xs flex items-center justify-center gap-2 transition duration-300 select-none ${
              photos.length > 0
                ? 'bg-[#b76e79] hover:bg-[#a35d68] text-white cursor-pointer shadow-lg shadow-[#b76e79]/20 font-semibold'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Begin Disha's Journey <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
