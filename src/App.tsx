import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getPhotos, clearPhotos, SavedPhoto } from './utils/db';
import { ParticleCanvas, ParticleCanvasRef } from './components/ParticleCanvas';
import { MemoryUploader } from './components/MemoryUploader';
import { Scene1Opening } from './components/Scene1Opening';
import { Scene2Tunnel } from './components/Scene2Tunnel';
import { Scene3Gallery } from './components/Scene3Gallery';
import { Scene4Message } from './components/Scene4Message';
import { Scene5Cake } from './components/Scene5Cake';
import { Scene6Sky } from './components/Scene6Sky';
import { Scene7Ending } from './components/Scene7Ending';
import { Sparkles, Music, Music2 } from 'lucide-react';
import { playDreamyChord } from './utils/audio';

type ActiveScene = 'uploader' | 'opening' | 'tunnel' | 'gallery' | 'message' | 'cake' | 'sky' | 'ending';

export default function App() {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [scene, setScene] = useState<ActiveScene>('uploader');
  const [isLoading, setIsLoading] = useState(true);
  const particleCanvasRef = useRef<ParticleCanvasRef>(null);

  // Load photos from IndexedDB on startup
  useEffect(() => {
    async function loadStoredMemories() {
      try {
        const storedPhotos = await getPhotos();
        if (storedPhotos && storedPhotos.length > 0) {
          setPhotos(storedPhotos);
          setScene('opening');
        } else {
          setScene('uploader');
        }
      } catch (e) {
        console.error('Failed to parse IndexedDB:', e);
        setScene('uploader');
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredMemories();
  }, []);

  const handleUploadDone = (uploaded: SavedPhoto[]) => {
    setPhotos(uploaded);
    setScene('opening');
    playDreamyChord();
  };

  const clearAndResetPhotos = async () => {
    setIsLoading(true);
    await clearPhotos();
    setPhotos([]);
    setScene('uploader');
    setIsLoading(false);
  };

  // Nav actions
  const nextScene = () => {
    const scenes: ActiveScene[] = ['opening', 'tunnel', 'gallery', 'message', 'cake', 'sky', 'ending'];
    const currentIdx = scenes.indexOf(scene);
    if (currentIdx !== -1 && currentIdx < scenes.length - 1) {
      setScene(scenes[currentIdx + 1]);
    } else if (scene === 'ending') {
      setScene('opening');
    }
  };

  const prevScene = () => {
    const scenes: ActiveScene[] = ['opening', 'tunnel', 'gallery', 'message', 'cake', 'sky', 'ending'];
    const currentIdx = scenes.indexOf(scene);
    if (currentIdx > 0) {
      setScene(scenes[currentIdx - 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center select-none">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#b76e79]/20 blur-xl animate-pulse" />
          <Sparkles className="w-12 h-12 text-[#b76e79] animate-spin duration-3000 relative z-10" />
        </div>
        <p className="text-gray-400 font-mono text-xs tracking-widest uppercase mt-4 animate-pulse">
          Illuminating the Sanctuary...
        </p>
      </div>
    );
  }

  return (
    <div id="app-root-cinematic-stage" className="relative min-h-screen w-full bg-[#050510] text-gray-100 overflow-x-hidden select-none font-sans">
      
      {/* Universal Canvas Particles Backdrop */}
      <ParticleCanvas ref={particleCanvasRef} scene={scene} />

      {/* Floating Sparkle controls left top corner */}
      {scene !== 'uploader' && (
        <div className="fixed top-5 right-6 z-40 flex items-center gap-3 select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 glass px-3.5 py-1.5 rounded-full border border-[rgba(183,110,121,0.25)]"
          >
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-[#f3cbd1] uppercase">
              {scene} MODE
            </span>
          </motion.div>
          
          <button
            id="global-bell-chord-btn"
            onClick={playDreamyChord}
            title="Play Dream Chime"
            className="w-8 h-8 rounded-full glass flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[#f3cbd1] hover:bg-rose-500/10 cursor-pointer transition tap-highlight-transparent"
          >
            <Music2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Central Screen Scenes Transitions with Framer Motion AnimatePresence */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="w-full flex-1 flex flex-col items-center justify-center"
          >
            {scene === 'uploader' && (
              <MemoryUploader onUploadComplete={handleUploadDone} />
            )}

            {scene === 'opening' && (
              <Scene1Opening photos={photos} onNext={nextScene} />
            )}

            {scene === 'tunnel' && (
              <Scene2Tunnel photos={photos} onNext={nextScene} onPrev={prevScene} />
            )}

            {scene === 'gallery' && (
              <Scene3Gallery
                photos={photos}
                onNext={nextScene}
                onPrev={prevScene}
                onParticleTrigger={() => particleCanvasRef.current?.triggerConfetti()}
              />
            )}

            {scene === 'message' && (
              <Scene4Message onNext={nextScene} onPrev={prevScene} />
            )}

            {scene === 'cake' && (
              <Scene5Cake
                onNext={nextScene}
                onPrev={prevScene}
                onConfettiTrigger={() => particleCanvasRef.current?.triggerConfetti()}
                onBalloonTrigger={() => particleCanvasRef.current?.triggerBalloon()}
              />
            )}

            {scene === 'sky' && (
              <Scene6Sky
                photos={photos}
                onNext={nextScene}
                onPrev={prevScene}
                onLanternTrigger={(x) => particleCanvasRef.current?.triggerLantern(x)}
              />
            )}

            {scene === 'ending' && (
              <Scene7Ending
                onNext={nextScene}
                onPrev={prevScene}
                onFireworkTrigger={(x, y) => particleCanvasRef.current?.triggerFirework(x, y)}
                onBalloonTrigger={() => particleCanvasRef.current?.triggerBalloon()}
                onResetPhotos={clearAndResetPhotos}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
