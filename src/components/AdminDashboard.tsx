import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, ShieldCheck, Eye, Trash2, CheckCircle, 
  X, FileDown, FileUp, Sparkles, RefreshCw, AlertCircle, ArrowLeft, ArrowRight, Heart, PenTool, MessageSquare
} from 'lucide-react';
import { SavedPhoto, getPhotos, savePhoto, deletePhoto, clearPhotos } from '../utils/db';
import { 
  verifyAdminPasscode, 
  getLocalLockState, 
  setLocalLockState, 
  getLocalApprovedIds, 
  setLocalApprovedIds,
  generateConfigJson,
  isPasswordSecure,
  setAdminPassword,
  getUserInputAccessEnabled,
  setUserInputAccessEnabled,
  getBirthdayMessageLines,
  setBirthdayMessageLines
} from '../utils/admin';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshData?: () => void;
  celebrantName: string;
  onUpdateCelebrantName: (name: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onRefreshData, celebrantName, onUpdateCelebrantName }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('disha_admin_authed') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [photosPool, setPhotosPool] = useState<SavedPhoto[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(getLocalLockState());
  const [approvedIds, setApprovedIds] = useState<string[]>(getLocalApprovedIds());
  const [syncStatus, setSyncStatus] = useState<string>('');
  
  const [celebrantNameInput, setCelebrantNameInput] = useState<string>(celebrantName);

  useEffect(() => {
    setCelebrantNameInput(celebrantName);
  }, [celebrantName]);
  
  // Load files for preview / import
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Re-verification and action confirmation states
  const [pendingAction, setPendingAction] = useState<{
    callback: () => void | Promise<void>;
    message: string;
  } | null>(null);
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Password modification states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Guest input customizer states
  const [userInputAccessEnabled, setUserInputAccessEnabledState] = useState<boolean>(() => getUserInputAccessEnabled());
  const [msgLine1, setMsgLine1] = useState<string>(() => getBirthdayMessageLines().line1);
  const [msgLine2, setMsgLine2] = useState<string>(() => getBirthdayMessageLines().line2);
  const [msgLine3, setMsgLine3] = useState<string>(() => getBirthdayMessageLines().line3);
  const [msgFeedback, setMsgFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadPhotosPool();
    }
  }, [isAuthenticated]);

  const loadPhotosPool = async () => {
    const allPhotos = await getPhotos();
    setPhotosPool(allPhotos);
    
    // Auto-approve photos that are already in the approved set.
    // If approvedIds list is entirely empty, we default-approve everything so that
    // there's a fallback, or we let them manually approve. Let's synchronize the IDs.
    const currentApproved = getLocalApprovedIds();
    if (currentApproved.length === 0 && allPhotos.length > 0) {
      // Initialize with all photos approved
      const allIds = allPhotos.map(p => p.id);
      setApprovedIds(allIds);
      setLocalApprovedIds(allIds);
    } else {
      setApprovedIds(currentApproved);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPasscode(passcode)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('disha_admin_authed', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Unauthorized Entry Signature. Please try again.');
      setPasscode('');
    }
  };

  // Helper to wrap protected modifications with a password check
  const executeProtectedAction = (callback: () => void | Promise<void>, message: string) => {
    setPendingAction({ callback, message });
    setConfirmPasscode('');
    setConfirmError('');
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPasscode(confirmPasscode)) {
      if (pendingAction) {
        await pendingAction.callback();
      }
      setPendingAction(null);
      setConfirmPasscode('');
      setConfirmError('');
    } else {
      setConfirmError('Incorrect security password.');
      setConfirmPasscode('');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyAdminPasscode(currentPasswordInput)) {
      setPwdFeedback({ type: 'error', message: 'Current master password verification failed.' });
      return;
    }
    const check = isPasswordSecure(newPasswordInput);
    if (!check.secure) {
      setPwdFeedback({ type: 'error', message: check.feedback });
      return;
    }
    setAdminPassword(newPasswordInput);
    setPwdFeedback({ type: 'success', message: 'Master password updated securely!' });
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setTimeout(() => setPwdFeedback(null), 5000);
  };

  const handleLockToggle = () => {
    executeProtectedAction(() => {
      const newState = !isLocked;
      setIsLocked(newState);
      setLocalLockState(newState);
      showNotice(newState ? 'Portal Locked. Direct experience start active.' : 'Portal Unlocked.');
      if (onRefreshData) onRefreshData();
    }, 'Toggle gateway lock state (forced direct-to-canvas mode / live uploads enabled)');
  };

  const handleToggleApprove = (photoId: string) => {
    executeProtectedAction(() => {
      let updated: string[];
      if (approvedIds.includes(photoId)) {
        updated = approvedIds.filter(id => id !== photoId);
      } else {
        updated = [...approvedIds, photoId];
      }
      setApprovedIds(updated);
      setLocalApprovedIds(updated);
      if (onRefreshData) onRefreshData();
    }, 'Toggle approved state for the selected photo');
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Permanently remove this photo from database pool?')) {
      executeProtectedAction(async () => {
        await deletePhoto(id);
        const updatedApproved = approvedIds.filter(photoId => photoId !== id);
        setApprovedIds(updatedApproved);
        setLocalApprovedIds(updatedApproved);
        loadPhotosPool();
        showNotice('Memory deleted from pool.');
        if (onRefreshData) onRefreshData();
      }, 'Permanently delete uploaded memory from device storage');
    }
  };

  const handleApproveAll = () => {
    executeProtectedAction(() => {
      const allIds = photosPool.map(p => p.id);
      setApprovedIds(allIds);
      setLocalApprovedIds(allIds);
      showNotice('All memories approved.');
      if (onRefreshData) onRefreshData();
    }, 'Approve entire uploaded photo database pool');
  };

  const handleRejectAll = () => {
    executeProtectedAction(() => {
      setApprovedIds([]);
      setLocalApprovedIds([]);
      showNotice('All approvals revoked.');
      if (onRefreshData) onRefreshData();
    }, 'Revoke approval permission for all list entries');
  };

  const handleUpdateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeProtectedAction(() => {
      setBirthdayMessageLines(msgLine1, msgLine2, msgLine3);
      setMsgFeedback({ type: 'success', message: 'Birthday message lines updated successfully!' });
      setTimeout(() => setMsgFeedback(null), 4000);
      if (onRefreshData) onRefreshData();
    }, 'Update global custom birthday message written in Step 4 letter');
  };

  const handleUserInputAccessToggle = () => {
    executeProtectedAction(() => {
      const newState = !userInputAccessEnabled;
      setUserInputAccessEnabledState(newState);
      setUserInputAccessEnabled(newState);
      showNotice(newState ? 'Guest input permissions globally enabled.' : 'Guest input permissions restricted by Gatekeeper.');
      if (onRefreshData) onRefreshData();
    }, 'Toggle guest input permissions for Step 6 Lanterns and Step 7 Guest Book');
  };

  const showNotice = (text: string) => {
    setSyncStatus(text);
    setTimeout(() => setSyncStatus(''), 4000);
  };

  // Export disha-config.json
  const handleExportConfig = () => {
    try {
      const jsonContent = generateConfigJson(
        isLocked,
        approvedIds,
        photosPool,
        userInputAccessEnabled,
        msgLine1,
        msgLine2,
        msgLine3,
        celebrantName
      );
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'disha-config.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotice('Config package exported successfully!');
    } catch (err) {
      console.error(err);
      showNotice('Failed to generate export file.');
    }
  };

  // Import disha-config.json
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      executeProtectedAction(async () => {
        try {
          const text = event.target?.result as string;
          const configData = JSON.parse(text);
          
          if (!configData || typeof configData !== 'object') {
            throw new Error('Invalid JSON structure.');
          }

          // Apply lock state
          const importedLock = !!configData.isLocked;
          setIsLocked(importedLock);
          setLocalLockState(importedLock);

          // Apply user input access state
          const importedInputAccess = configData.userInputAccessEnabled !== false;
          setUserInputAccessEnabledState(importedInputAccess);
          setUserInputAccessEnabled(importedInputAccess);

          // Apply birthday message lines
          const importedLine1 = configData.msgLine1 || '';
          const importedLine2 = configData.msgLine2 || '';
          const importedLine3 = configData.msgLine3 || '';
          if (importedLine1) {
            setMsgLine1(importedLine1);
            setMsgLine2(importedLine2);
            setMsgLine3(importedLine3);
            setBirthdayMessageLines(importedLine1, importedLine2, importedLine3);
          }

          // Apply celebrant name
          const importedCelebrantName = configData.celebrantName || '';
          if (importedCelebrantName) {
            onUpdateCelebrantName(importedCelebrantName);
          }

          // Apply approved photo ids
          const importedApprovedIds = Array.isArray(configData.approvedPhotoIds) ? configData.approvedPhotoIds : [];
          setApprovedIds(importedApprovedIds);
          setLocalApprovedIds(importedApprovedIds);

          // Import photos themselves into IndexedDB
          const importedPhotos = Array.isArray(configData.photos) ? configData.photos : [];
          if (importedPhotos.length > 0) {
            for (const photo of importedPhotos) {
              await savePhoto(photo);
            }
          }

          setImportStatus({ type: 'success', text: 'Configuration Imported Successfully!' });
          loadPhotosPool();
          if (onRefreshData) onRefreshData();
        } catch (err) {
          console.error(err);
          setImportStatus({ type: 'error', text: 'Error importing file. Make sure it is a valid disha-config.json.' });
        }
        setTimeout(() => setImportStatus(null), 5000);
      }, 'Import configuration state package (will overwrite existing local database approvals & state)');
    };
    reader.readAsText(file);
  };

  const handlePurgeAll = async () => {
    if (confirm('⚠️ WARNING: This will completely wipe all uploaded photos from the local database pool. This cannot be undone. Proceed?')) {
      executeProtectedAction(async () => {
        await clearPhotos();
        setApprovedIds([]);
        setLocalApprovedIds([]);
        loadPhotosPool();
        showNotice('Database pool fully purged.');
        if (onRefreshData) onRefreshData();
      }, 'CRITICAL: Permanently wipe total memory base pool and revoke approvals');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('disha_admin_authed');
    setIsAuthenticated(false);
  };

  return (
    <div id="admin-desk-overlay" className="fixed inset-0 min-h-screen w-full bg-[#03030a]/95 text-gray-100 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto selection:bg-[#b76e79]/30">
      
      {/* Visual Ambient Background glows */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />

      {/* Close button at top right */}
      <button 
        id="admin-dashboard-close-corner-btn"
        onClick={onClose}
        className="fixed top-6 right-6 w-10 h-10 glass rounded-full flex items-center justify-center text-gray-400 hover:text-white transition duration-300 pointer-events-auto border border-white/10 hover:border-white/20 select-none z-55 cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* LOGIN CARD SCREEN */
          <motion.div
            key="login-desk"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md glass-premium p-8 rounded-2xl relative border border-[#b76e79]/15 text-center shadow-2xl"
          >
            <div className="w-14 h-14 bg-red-950/40 border border-[#b76e79]/40 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-[#b76e79] rose-glow" />
            </div>

            <h2 className="font-display text-2xl font-bold tracking-normal text-white mb-2">
              Bespoke Portal Administration
            </h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed font-sans">
              Enter your authentication passcode to enter the live control panel. Unauthorized access is forbidden.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Master Passcode"
                  className="w-full bg-[#0d0a18]/80 text-white font-mono tracking-widest text-center px-4 py-3 rounded-lg border border-[rgba(183,110,121,0.2)] focus:outline-none focus:border-[#b76e79]/60 text-sm placeholder:text-gray-600 transition"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 text-xs justify-center bg-red-950/20 py-2.5 px-3 rounded-md border border-red-950/40 font-sans">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                id="admin-auth-submit-btn"
                type="submit"
                className="w-full py-3 bg-[rgba(183,110,121,0.8)] hover:bg-[#b76e79] text-white rounded-lg text-xs tracking-widest font-mono font-medium uppercase transition shadow-md shadow-[#b76e79]/10 cursor-pointer"
              >
                AUTHISE CONNECTION
              </button>
            </form>

            <button
              id="admin-cancel-login-btn"
              onClick={onClose}
              className="mt-5 text-[11px] font-mono tracking-widest text-gray-500 hover:text-gray-300 transition uppercase cursor-pointer"
            >
              Cancel and Return
            </button>
          </motion.div>
        ) : (
          /* ADMIN DASHBOARD CONSOLE */
          <motion.div
            key="admin-console-desk"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl glass-premium px-6 py-6 sm:px-8 sm:py-8 rounded-2xl border border-[rgba(255,255,255,0.08)] relative shadow-2xl flex flex-col gap-6"
          >
            
            {/* Header block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-5 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#b76e79] uppercase">
                    ACTIVE CONTROL NODE • PORTAL DESK
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  {celebrantName}'s Birthday Web Customizer <Sparkles className="w-5 h-5 text-amber-300" />
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  id="admin-refresh-pool-btn"
                  onClick={loadPhotosPool}
                  className="px-3.5 py-1.5 font-mono text-[10px] tracking-widest text-[#f3cbd1] border border-[#b76e79]/20 hover:border-[#b76e79]/50 rounded-full flex items-center gap-1.5 hover:bg-white/5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload Pool
                </button>
                <button
                  id="admin-logout-btn"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 font-mono text-[10px] tracking-widest text-gray-400 border border-white/10 hover:border-white/20 rounded-full hover:bg-white/5 transition cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Notification system notices */}
            <AnimatePresence>
              {syncStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 py-2.5 px-4 rounded-lg text-xs font-mono tracking-wider flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{syncStatus}</span>
                </motion.div>
              )}
              {importStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`py-2.5 px-4 rounded-lg text-xs font-sans tracking-wide border flex items-center gap-2 ${
                    importStatus.type === 'success' 
                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' 
                    : 'bg-red-950/20 text-red-400 border-red-900/40'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importStatus.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TWO-COLUMN LAYOUT DESK */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column Controls */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. PORTAL GATE STATE */}
                <div className="glass p-5 rounded-xl border border-white/5">
                  <h3 className="font-display text-sm font-semibold text-gray-300 tracking-wide mb-3 flex items-center gap-2">
                    UPLOADER GATEWAY CONTROLS
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans mb-5">
                    Toggle whether web visitors are forced onto the photo upload page or bypass it cleanly.
                  </p>

                  <div className="relative flex flex-col items-center">
                    <button
                      id="admin-portal-lock-toggle-btn"
                      onClick={handleLockToggle}
                      className={`w-full py-4 rounded-xl flex flex-col items-center justify-center border-2 transition duration-300 cursor-pointer ${
                        isLocked 
                        ? 'bg-red-950/20 border-[#b76e79] text-red-300 shadow-md shadow-red-900/15' 
                        : 'bg-emerald-950/10 border-emerald-500/40 text-emerald-300 shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 font-sans font-bold">
                        {isLocked ? (
                          <>
                            <Lock className="w-4 h-4" /> <span>LOCKED (START SCENE 2)</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" /> <span>UNLOCKED (ALLOW UPLOADS)</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] tracking-wide text-gray-400 font-normal px-4 text-center font-sans">
                        {isLocked 
                          ? 'Visitors start directly on the visual slideshow cards. Upload page is hidden.' 
                          : 'Visitors are prompted to drag-drop or upload photos on start.'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 1.5 GUEST INPUT CONTROLS */}
                <div className="glass p-5 rounded-xl border border-white/5 space-y-3">
                  <h3 className="font-display text-sm font-semibold text-gray-300 tracking-wide flex items-center gap-2 uppercase">
                    Guest Input Gatekeeper
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    Enable or restrict visitors' permission to type wishes in Step 6 (Wish Lanterns) and Step 7 (Guest Register). If disabled, inputs are locked but existing entries continue to glow.
                  </p>

                  <button
                    id="admin-input-access-toggle-btn"
                    onClick={handleUserInputAccessToggle}
                    className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 border transition duration-300 font-mono text-xs cursor-pointer ${
                      userInputAccessEnabled
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-red-950/20 border-[#b76e79]/40 text-red-300 shadow-sm'
                    }`}
                  >
                    {userInputAccessEnabled ? (
                      <>
                        <Unlock className="w-4 h-4 text-emerald-400" />
                        <span>GUEST INPUTS: GRANTED</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#b76e79]" />
                        <span>GUEST INPUTS: RESTRICTED</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 1.55 CELEBRANT NAME CUSTOMIZER */}
                <div className="glass p-5 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-gray-300 tracking-wide flex items-center gap-2 uppercase">
                      Celebrant Name Customizer
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                      Change the main celebrant's name dynamically from {celebrantName} to anything else instantly across all pages.
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!celebrantNameInput.trim()) return;
                    executeProtectedAction(() => {
                      onUpdateCelebrantName(celebrantNameInput.trim());
                      showNotice(`Celebrant name updated to ${celebrantNameInput.trim()}!`);
                    }, `Change celebrant's name to ${celebrantNameInput.trim()}`);
                  }} className="space-y-3.5">
                    <div>
                      <input
                        type="text"
                        required
                        value={celebrantNameInput}
                        onChange={(e) => setCelebrantNameInput(e.target.value)}
                        placeholder="e.g. Sneha"
                        className="w-full bg-[#0d0a18]/80 text-white font-sans text-xs px-3.5 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#b76e79]/50 transition"
                      />
                    </div>
                    <button
                      id="admin-update-celebrant-name-btn"
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-[#b76e79]/80 to-[#c2818c]/80 hover:brightness-110 text-white text-[10px] font-mono tracking-widest uppercase transition rounded-lg cursor-pointer"
                    >
                      Update Celebrant Name
                    </button>
                  </form>
                </div>

                {/* 1.6 BIRTHDAY CARD MESSAGE CUSTOMIZER */}
                <div className="glass p-5 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-gray-300 tracking-wide flex items-center gap-2 uppercase">
                      Step 4 Letter Message
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                      Dynamically tailor the digital birthday letter written for {celebrantName} inside Step 4's Royal Envelope.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateMessage} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest uppercase text-gray-500 mb-1.5">Letter Line 1 (Main Wish scroll)</label>
                      <textarea
                        rows={2}
                        required
                        value={msgLine1}
                        onChange={(e) => setMsgLine1(e.target.value)}
                        placeholder="May this year bring..."
                        className="w-full bg-[#0d0a18]/80 text-white font-sans text-xs px-3.5 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#b76e79]/50 transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-widest uppercase text-gray-500 mb-1.5">Letter Line 2 (Subtext block)</label>
                      <input
                        type="text"
                        required
                        value={msgLine2}
                        onChange={(e) => setMsgLine2(e.target.value)}
                        placeholder="You deserve all the joy..."
                        className="w-full bg-[#0d0a18]/80 text-white font-sans text-xs px-3.5 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#b76e79]/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono tracking-widest uppercase text-gray-500 mb-1.5">Letter Line 3 (Signature Happy Birthday)</label>
                      <input
                        type="text"
                        required
                        value={msgLine3}
                        onChange={(e) => setMsgLine3(e.target.value)}
                        placeholder={`Happy Birthday, ${celebrantName}`}
                        className="w-full bg-[#0d0a18]/80 text-[#ffd700] font-sans font-medium gold-glow text-xs px-3.5 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#b76e79]/50 transition"
                      />
                    </div>

                    {msgFeedback && (
                      <p className={`text-[10px] p-2 rounded-md ${
                        msgFeedback.type === 'success' 
                        ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20' 
                        : 'bg-red-950/20 text-red-400 border border-red-900/20'
                      }`}>
                        {msgFeedback.message}
                      </p>
                    )}

                    <button
                      id="admin-update-message-submit-btn"
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-[#b76e79]/80 to-[#c2818c]/80 hover:brightness-110 text-white text-[10px] font-mono tracking-widest uppercase transition rounded-lg cursor-pointer"
                    >
                      Apply Message Edits
                    </button>
                  </form>
                </div>

                {/* 2. PERSISTENCE SHARING NODE */}
                <div className="glass p-5 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-gray-300 tracking-wide mb-1.5 flex items-center gap-2">
                      SAVE / SYNC GITHUB BUNDLE
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Because this is host-free on GitHub Pages, visitors on other devices don't see your local changes unless you save a config file.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {/* DOWNLOAD config button */}
                    <button
                      id="admin-download-json-bundle-btn"
                      onClick={handleExportConfig}
                      className="w-full py-3 px-4 rounded-lg bg-pink-900/30 hover:bg-pink-900/50 text-[#f3cbd1] border border-pink-700/30 text-xs font-mono tracking-widest flex items-center justify-center gap-2.5 transition cursor-pointer uppercase"
                    >
                      <FileDown className="w-4 h-4" /> Export Config Pack
                    </button>

                    {/* IMPORT config button */}
                    <label className="w-full py-3 px-4 rounded-lg bg-slate-950/50 hover:bg-slate-900/70 border border-white/10 text-xs font-mono tracking-widest flex items-center justify-center gap-2.5 transition cursor-pointer uppercase text-gray-400">
                      <FileUp className="w-4 h-4 text-gray-400" />
                      <span>Import Config Pack</span>
                      <input
                        type="file"
                        onChange={handleImportConfig}
                        accept=".json"
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-white/5">
                    <h4 className="text-[10px] font-mono tracking-widest text-[#ffd700] uppercase mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> GitHub Pages Playbook:
                    </h4>
                    <ol className="text-[9.5px] text-gray-500 font-sans list-decimal list-inside space-y-1 pl-0.5">
                      <li>Configure your photos pool and block state.</li>
                      <li>Click the "Export Config Pack" button above.</li>
                      <li>Rename file to exactly <code className="text-gray-300 font-mono bg-white/5 px-1 py-0.5 rounded">disha-config.json</code></li>
                      <li>Drop this file inside your project's <code className="text-gray-200">public/</code> root.</li>
                      <li>Commit & push to your GitHub repo branch <code className="text-gray-300 font-mono">main</code>.</li>
                    </ol>
                    <p className="text-[9px] text-zinc-500 font-sans italic mt-1.5">
                      Once pushed, the live page will instantly start from the slideshow using the approved bundle!
                    </p>
                  </div>
                </div>

                {/* SECURE ADMIN CREDENTIAL KEY MANAGEMENT */}
                <div className="glass p-5 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-gray-300 tracking-wide mb-1 flex items-center gap-2">
                       ADMIN SECURITY PORTAL KEYS
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                      Establish a custom, secure password to guard lock modifications and photo approvals. This invalidates temporary session exploits.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest uppercase text-gray-500 mb-1.5">CURRENT ADMIN PASSWORD</label>
                      <input
                        type="password"
                        placeholder="Current Gatekeeper Key"
                        required
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        className="w-full bg-[#0d0a18]/80 text-white font-mono text-xs px-3.5 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#b76e79]/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono tracking-widest uppercase text-gray-500 mb-1.5">NEW MASTER PASSWORD</label>
                      <input
                        type="password"
                        placeholder="Min 6 chars, with index figures & symbols"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full bg-[#0d0a18]/80 text-white font-mono text-xs px-3.5 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#b76e79]/50 transition"
                      />
                    </div>

                    {pwdFeedback && (
                      <p className={`text-[10px] leading-relaxed font-sans p-2 rounded-md ${
                        pwdFeedback.type === 'success' 
                        ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20' 
                        : 'bg-red-950/20 text-red-400 border border-red-900/20'
                      }`}>
                        {pwdFeedback.message}
                      </p>
                    )}

                    <button
                      id="admin-change-password-submit-btn"
                      type="submit"
                      className="w-full py-2.5 bg-zinc-900 hover:bg-[#b76e79]/40 border border-[#b76e79]/30 text-white text-[10px] font-mono tracking-widest uppercase transition rounded-lg cursor-pointer"
                    >
                      Update Security Key
                    </button>
                  </form>
                </div>

                {/* 3. DANGER ZONE LOCKOUT */}
                <div className="glass p-5 rounded-xl border border-red-950/20 space-y-3">
                  <h3 className="font-display text-xs font-semibold text-red-400 tracking-wider uppercase">
                    SYSTEM RESET GATE
                  </h3>
                  <button
                    id="admin-wipe-all-photos-pool-btn"
                    onClick={handlePurgeAll}
                    className="w-full py-2 px-3 border border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-950/15 text-[10px] font-mono tracking-widest uppercase transition rounded-lg cursor-pointer"
                  >
                    WIPE LOCAL DB POOL
                  </button>
                </div>

              </div>

              {/* Right Column (PHOTO MODERATION BOARD) */}
              <div className="lg:col-span-8 glass p-5 sm:p-6 rounded-xl border border-white/5 flex flex-col gap-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                      PHOTO MODERATION CENTER ({photosPool.length})
                    </h3>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">
                      Select which uploaded photos can appear inside Disha's live birthday slideshow. Only approved items render!
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      id="admin-approve-all-btn"
                      onClick={handleApproveAll}
                      className="text-[10px] font-mono tracking-widest text-emerald-400 hover:text-emerald-300 transition bg-emerald-950/10 hover:bg-emerald-950/30 px-3 py-1.5 rounded-md border border-emerald-500/20 cursor-pointer"
                    >
                      Approve All
                    </button>
                    <button
                      id="admin-reject-all-btn"
                      onClick={handleRejectAll}
                      className="text-[10px] font-mono tracking-widest text-gray-400 hover:text-gray-200 transition bg-zinc-900 px-3 py-1.5 rounded-md border border-white/5 cursor-pointer"
                    >
                      Wipe Approvals
                    </button>
                  </div>
                </div>

                {photosPool.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                    <Eye className="w-10 h-10 text-gray-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-400 mb-1 font-sans">
                      No memories currently in database pool
                    </p>
                    <p className="text-xs text-gray-600 max-w-sm text-center leading-relaxed font-sans px-4">
                      Unlock the gateway to allow friends to upload pictures, or go back to the front-page to load demo artwork!
                    </p>
                  </div>
                ) : (
                  /* Grid stream of uploads */
                  <div id="admin-moderator-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[460px] overflow-y-auto no-scrollbar p-1">
                    {photosPool.map((photo) => {
                      const isApproved = approvedIds.includes(photo.id);
                      return (
                        <div 
                          key={photo.id}
                          className={`relative rounded-xl overflow-hidden glass border-2 transition-all duration-300 group flex flex-col h-fit ${
                            isApproved 
                            ? 'border-[#b76e79] scale-[0.98] shadow-lg shadow-[#b76e79]/5' 
                            : 'border-white/5 scale-[0.97] opacity-65 hover:opacity-100 hover:border-white/10'
                          }`}
                        >
                          {/* Image frame */}
                          <div className="aspect-square w-full relative overflow-hidden bg-slate-900 border-b border-white/5">
                            <img
                              src={photo.dataUrl}
                              alt={photo.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            
                            {/* Badges layer overlay */}
                            <div className="absolute top-2 left-2 z-10 flex gap-1 items-center">
                              {isApproved ? (
                                <span className="bg-[#b76e79] text-white rounded-full p-1 shadow-md">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="bg-black/60 text-gray-400 rounded-full p-1 border border-white/10">
                                  <Lock className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>

                            {/* Hover Overlay Trigger */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                              <button
                                id={`admin-toggle-btn-${photo.id}`}
                                onClick={() => handleToggleApprove(photo.id)}
                                className={`h-8 w-8 rounded-full flex items-center justify-center transition border ${
                                  isApproved 
                                  ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600' 
                                  : 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600'
                                } cursor-pointer`}
                                title={isApproved ? "Revoke Approval" : "Approve Photo"}
                              >
                                {isApproved ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                id={`admin-delete-btn-${photo.id}`}
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white border border-red-500 flex items-center justify-center transition cursor-pointer"
                                title="Delete Permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Footer label details */}
                          <div className="p-2.5 bg-[#000000]/40 flex flex-col gap-0.5 justify-center">
                            <span className="text-[10px] font-semibold text-gray-300 truncate font-sans">
                              {photo.name || 'Unnamed Memory'}
                            </span>
                            <span className="text-[8px] font-mono text-gray-500 uppercase">
                              {new Date(photo.timestamp).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Back indicator button */}
            <div className="flex justify-end border-t border-white/5 pt-5 select-none">
              <button
                id="admin-close-bottom-btn"
                onClick={onClose}
                className="px-6 py-2.5 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-lg hover:bg-slate-900 text-xs font-sans tracking-widest text-[#f3cbd1] flex items-center gap-2 transition cursor-pointer font-medium uppercase"
              >
                <ArrowLeft className="w-4 h-4" /> Close and Return to Canvas
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Modification Reauthorization Overlay */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm glass-premium p-6 rounded-xl border border-[#b76e79]/30 text-center shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-rose-950/30 border border-[#b76e79]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-5 h-5 text-[#b76e79] rose-glow" />
              </div>

              <h4 className="font-display text-sm font-bold tracking-tight text-white mb-1.5 uppercase">
                Authorize Modification
              </h4>
              <p className="text-[11px] text-gray-400 font-sans mb-5 leading-relaxed bg-white/5 py-2 px-3 rounded-md border border-white/5">
                Action: <span className="text-rose-300 font-medium">{pendingAction.message}</span>
              </p>

              <form onSubmit={handleConfirmSubmit} className="space-y-4 font-sans">
                <input
                  type="password"
                  placeholder="Master Admin Password"
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className="w-full bg-[#0d0a18]/80 text-white font-mono tracking-widest text-center px-4 py-2.5 rounded-lg border border-[#b76e79]/20 focus:outline-none focus:border-[#b76e79]/60 text-xs placeholder:text-gray-600 transition"
                  autoFocus
                />

                {confirmError && (
                  <p className="text-xs text-red-400 font-sans bg-red-950/20 py-1.5 px-2.5 rounded border border-red-950/40">
                    {confirmError}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    id="admin-confirm-cancel-btn"
                    type="button"
                    onClick={() => setPendingAction(null)}
                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-gray-400 text-[10px] font-mono tracking-wider rounded-lg border border-white/5 transition cursor-pointer select-none"
                  >
                    CANCEL
                  </button>
                  <button
                    id="admin-confirm-authorized-btn"
                    type="submit"
                    className="flex-1 py-2 bg-[#b76e79] hover:bg-[#b76e79]/90 text-white text-[10px] font-mono tracking-wider rounded-lg shadow-md shadow-[#b76e79]/10 transition cursor-pointer"
                  >
                    CONFIRM
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
