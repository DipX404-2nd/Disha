import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getPhotos, clearPhotos, SavedPhoto, savePhoto } from './utils/db';
import { ParticleCanvas, ParticleCanvasRef } from './components/ParticleCanvas';
import { MemoryUploader } from './components/MemoryUploader';
import { Scene1Opening } from './components/Scene1Opening';
import { Scene2Tunnel } from './components/Scene2Tunnel';
import { Scene3Gallery } from './components/Scene3Gallery';
import { Scene4Message } from './components/Scene4Message';
import { Scene5Cake } from './components/Scene5Cake';
import { Scene6Sky } from './components/Scene6Sky';
import { Scene7Ending } from './components/Scene7Ending';
import { AdminDashboard } from './components/AdminDashboard';
import { Sparkles, Music, Music2, Lock } from 'lucide-react';
import { playDreamyChord } from './utils/audio';
import { fetchCommittedConfig, getLocalLockState, getLocalApprovedIds, getUserInputAccessEnabled, getBirthdayMessageLines, getCelebrantName, setCelebrantName, getServerState, getServerPhotos, uploadServerPhoto, clearServerPhotos } from './utils/admin';

type ActiveScene = 'uploader' | 'opening' | 'tunnel' | 'gallery' | 'message' | 'cake' | 'sky' | 'ending';

export default function App() {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [scene, setScene] = useState<ActiveScene>('uploader');
  const [isUserInputEnabled, setIsUserInputEnabled] = useState<boolean>(true);
  const [msgLines, setMsgLines] = useState(() => getBirthdayMessageLines());
  const [celebrantName, setCelebrantNameState] = useState(() => getCelebrantName());
  const [isLoading, setIsLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(window.location.hash === '#admin');
  const particleCanvasRef = useRef<ParticleCanvasRef>(null);

  // Monitor window hash changes for admin routing
  useEffect(() => {
    const handleHashChange = () => {
      setShowAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadStoredMemories = async () => {
    try {
      setIsLoading(true);
      
      // Step A: Contact the backend to synchronize all photos, locks, and designs across devices
      let serverState = null;
      let serverPhotos: SavedPhoto[] = [];
      try {
        serverState = await getServerState();
        serverPhotos = await getServerPhotos();
      } catch (err) {
        console.warn("Could not connect to database, utilizing local storage cash fallback.", err);
      }

      if (serverState) {
        setIsUserInputEnabled(serverState.userInputAccessEnabled);
        if (serverState.msgLines) {
          setMsgLines(serverState.msgLines);
        }
        setCelebrantNameState(serverState.celebrantName);
        
        // Match photos against backend approvedIDs
        const approvedIds = serverState.approvedPhotoIds || [];
        const approvedPhotos = serverPhotos.filter(p => approvedIds.includes(p.id));
        const activePhotos = approvedPhotos.length > 0 ? approvedPhotos : serverPhotos;
        setPhotos(activePhotos);

        if (serverState.isLocked) {
          setScene('opening');
        } else {
          if (activePhotos.length > 0) {
            setScene('opening');
          } else {
            setScene('uploader');
          }
        }
        return;
      }

      // Step B: Dedicated Config file fallback
      const committedConfig = await fetchCommittedConfig();
      if (committedConfig && committedConfig.isLocked) {
        setPhotos(committedConfig.photos);
        setIsUserInputEnabled(committedConfig.userInputAccessEnabled !== false);
        if (committedConfig.msgLine1) {
          setMsgLines({
            line1: committedConfig.msgLine1,
            line2: committedConfig.msgLine2 || '',
            line3: committedConfig.msgLine3 || ''
          });
        }
        if (committedConfig.celebrantName) {
          setCelebrantNameState(committedConfig.celebrantName);
          localStorage.setItem('disha_celebrant_name', committedConfig.celebrantName);
        }
        setScene('opening');
        return;
      }

      // Step C: If no connection and no config, local storage/IndexedDB fallback
      const storedPhotos = await getPhotos();
      const isLocalLocked = getLocalLockState();
      const approvedIds = getLocalApprovedIds();
      setIsUserInputEnabled(getUserInputAccessEnabled());

      if (isLocalLocked) {
        const approvedPhotos = storedPhotos.filter(p => approvedIds.includes(p.id));
        setPhotos(approvedPhotos.length > 0 ? approvedPhotos : storedPhotos);
        setScene('opening');
      } else {
        if (storedPhotos && storedPhotos.length > 0) {
          const approvedPhotos = storedPhotos.filter(p => approvedIds.includes(p.id));
          setPhotos(approvedPhotos.length > 0 ? approvedPhotos : storedPhotos);
          setScene('opening');
        } else {
          setScene('uploader');
        }
      }
    } catch (e) {
      console.error('Failed to parse memories boot phase:', e);
      setScene('uploader');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize from server periodically in the background (8s interval poll) for multiplayer feel
  useEffect(() => {
    let active = true;
    const fetchUpdatesSilently = async () => {
      try {
        const serverState = await getServerState();
        if (!active) return;
        const serverPhotos = await getServerPhotos();
        if (!active) return;
        
        setIsUserInputEnabled(serverState.userInputAccessEnabled);
        if (serverState.msgLines) {
          setMsgLines(serverState.msgLines);
        }
        setCelebrantNameState(serverState.celebrantName);
        
        const approvedIds = serverState.approvedPhotoIds || [];
        const approvedPhotos = serverPhotos.filter(p => approvedIds.includes(p.id));
        setPhotos(approvedPhotos.length > 0 ? approvedPhotos : serverPhotos);
      } catch (err) {
        // Fail silently to keep UX stellar
      }
    };
    
    const interval = setInterval(fetchUpdatesSilently, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Load photos from config or IndexedDB on startup
  useEffect(() => {
    loadStoredMemories();
  }, []);

  const handleUploadDone = async (uploaded: SavedPhoto[]) => {
    setPhotos(uploaded);
    setScene('opening');
    playDreamyChord();

    // Push uploaded photos to the shared cloud server db
    try {
      for (const p of uploaded) {
        await uploadServerPhoto(p);
      }
      // Re-fetch to stay perfectly synced
      const serverPhotos = await getServerPhotos();
      const state = await getServerState();
      const approvedIds = state.approvedPhotoIds || [];
      const approvedPhotos = serverPhotos.filter(p => approvedIds.includes(p.id));
      setPhotos(approvedPhotos.length > 0 ? approvedPhotos : serverPhotos);
    } catch (e) {
      console.error("Failed to upload assets to server storage:", e);
    }
  };

  const clearAndResetPhotos = async () => {
    setIsLoading(true);
    try {
      await clearServerPhotos();
    } catch (e) {
      console.error("Failed to clear server photos:", e);
    }
    await clearPhotos();
    setPhotos([]);
    setScene('uploader');
    setIsLoading(false);
  };

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      const serverState = await getServerState();
      const serverPhotos = await getServerPhotos();
      
      setIsUserInputEnabled(serverState.userInputAccessEnabled);
      if (serverState.msgLines) {
        setMsgLines(serverState.msgLines);
      }
      setCelebrantNameState(serverState.celebrantName);
      
      const approvedIds = serverState.approvedPhotoIds || [];
      const approvedPhotos = serverPhotos.filter(p => approvedIds.includes(p.id));
      const activePhotos = approvedPhotos.length > 0 ? approvedPhotos : serverPhotos;
      setPhotos(activePhotos);

      if (serverState.isLocked) {
        if (scene === 'uploader') {
          setScene('opening');
        }
      } else {
        if (activePhotos.length === 0) {
          setScene('uploader');
        }
      }
    } catch (e) {
      console.error("Error manual refresh from server:", e);
      
      // Fallback
      const storedPhotos = await getPhotos();
      const isLocalLocked = getLocalLockState();
      const approvedIds = getLocalApprovedIds();
      setIsUserInputEnabled(getUserInputAccessEnabled());
      setMsgLines(getBirthdayMessageLines());
      setCelebrantNameState(getCelebrantName());
      
      const approvedPhotos = storedPhotos.filter(p => approvedIds.includes(p.id));
      setPhotos(approvedPhotos.length > 0 ? approvedPhotos : storedPhotos);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCelebrantName = (newName: string) => {
    setCelebrantName(newName);
    setCelebrantNameState(newName);
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
              <MemoryUploader onUploadComplete={handleUploadDone} celebrantName={celebrantName} />
            )}

            {scene === 'opening' && (
              <Scene1Opening photos={photos} onNext={nextScene} celebrantName={celebrantName} />
            )}

            {scene === 'tunnel' && (
              <Scene2Tunnel photos={photos} onNext={nextScene} onPrev={prevScene} celebrantName={celebrantName} />
            )}

            {scene === 'gallery' && (
              <Scene3Gallery
                photos={photos}
                onNext={nextScene}
                onPrev={prevScene}
                onParticleTrigger={() => particleCanvasRef.current?.triggerConfetti()}
                celebrantName={celebrantName}
              />
            )}

            {scene === 'message' && (
              <Scene4Message msgLines={msgLines} onNext={nextScene} onPrev={prevScene} celebrantName={celebrantName} />
            )}

            {scene === 'cake' && (
              <Scene5Cake
                onNext={nextScene}
                onPrev={prevScene}
                onConfettiTrigger={() => particleCanvasRef.current?.triggerConfetti()}
                onBalloonTrigger={() => particleCanvasRef.current?.triggerBalloon()}
                celebrantName={celebrantName}
              />
            )}

            {scene === 'sky' && (
              <Scene6Sky
                photos={photos}
                isUserInputEnabled={isUserInputEnabled}
                onNext={nextScene}
                onPrev={prevScene}
                onLanternTrigger={(x) => particleCanvasRef.current?.triggerLantern(x)}
                celebrantName={celebrantName}
              />
            )}

            {scene === 'ending' && (
              <Scene7Ending
                isUserInputEnabled={isUserInputEnabled}
                onNext={nextScene}
                onPrev={prevScene}
                onFireworkTrigger={(x, y) => particleCanvasRef.current?.triggerFirework(x, y)}
                onBalloonTrigger={() => particleCanvasRef.current?.triggerBalloon()}
                onResetPhotos={clearAndResetPhotos}
                celebrantName={celebrantName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tiny subtle Admin Gateway Key in the bottom left corner */}
      <button
        id="subtle-admin-gate-trigger"
        onClick={() => {
          setShowAdmin(true);
          window.location.hash = '#admin';
        }}
        title="Admin Control Panel"
        className="fixed bottom-4 left-4 z-40 w-6 h-6 rounded-full flex items-center justify-center text-gray-700/30 hover:text-[#b76e79] hover:bg-white/5 border border-transparent hover:border-white/5 transition duration-500 cursor-pointer"
      >
        <Lock className="w-3 h-3" />
      </button>

      {/* Admin Dashboard Control Overlay */}
      <AnimatePresence>
        {showAdmin && (
          <AdminDashboard 
            onClose={() => {
              setShowAdmin(false);
              if (window.location.hash === '#admin') {
                window.history.pushState("", document.title, window.location.pathname + window.location.search);
              }
            }} 
            onRefreshData={handleRefreshData}
            celebrantName={celebrantName}
            onUpdateCelebrantName={handleUpdateCelebrantName}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
