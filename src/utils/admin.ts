import { SavedPhoto } from './db';

export interface DishaConfig {
  isLocked: boolean;
  approvedPhotoIds: string[];
  photos: SavedPhoto[];
  userInputAccessEnabled?: boolean;
  msgLine1?: string;
  msgLine2?: string;
  msgLine3?: string;
  celebrantName?: string;
}

export interface ServerState {
  isLocked: boolean;
  userInputAccessEnabled: boolean;
  celebrantName: string;
  msgLines: {
    line1: string;
    line2: string;
    line3: string;
  };
  authPassword?: string;
  approvedPhotoIds: string[];
}

const CONFIG_URL = './disha-config.json';
const DEFAULT_PASSCODE = 'disha2026';
const LOCK_KEY = 'disha_upload_locked';
const APPROVED_IDS_KEY = 'disha_approved_photo_ids';
const PASSWORD_KEY = 'disha_admin_password';
const USER_INPUT_ENABLED_KEY = 'disha_user_input_enabled';
const CELEBRANT_NAME_KEY = 'disha_celebrant_name';

const MSG_LINE1_KEY = 'disha_msg_line1';
const MSG_LINE2_KEY = 'disha_msg_line2';
const MSG_LINE3_KEY = 'disha_msg_line3';

const DEFAULT_CELEBRANT_NAME = 'Disha';
const DEFAULT_LINE1 = "May this year bring endless happiness, beautiful memories, success, laughter, and everything that makes you smile.";
const DEFAULT_LINE2 = "You deserve all the joy in the world.";
const DEFAULT_LINE3 = "Happy Birthday, " + DEFAULT_CELEBRANT_NAME;

// --- Server API Connectors ---

export async function getServerState(): Promise<ServerState> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Failed to fetch state from server');
  const data = await res.json();
  
  // Sync local cache with fetched server state
  if (data) {
    localStorage.setItem(LOCK_KEY, data.isLocked ? 'true' : 'false');
    localStorage.setItem(USER_INPUT_ENABLED_KEY, data.userInputAccessEnabled ? 'true' : 'false');
    localStorage.setItem(CELEBRANT_NAME_KEY, data.celebrantName || DEFAULT_CELEBRANT_NAME);
    localStorage.setItem(APPROVED_IDS_KEY, JSON.stringify(data.approvedPhotoIds || []));
    if (data.msgLines) {
      localStorage.setItem(MSG_LINE1_KEY, data.msgLines.line1 || DEFAULT_LINE1);
      localStorage.setItem(MSG_LINE2_KEY, data.msgLines.line2 || DEFAULT_LINE2);
      localStorage.setItem(MSG_LINE3_KEY, data.msgLines.line3 || DEFAULT_LINE3);
    }
    if (data.authPassword) {
      localStorage.setItem(PASSWORD_KEY, data.authPassword);
    }
  }
  return data;
}

export async function saveServerState(partial: Partial<ServerState>): Promise<ServerState> {
  const res = await fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial)
  });
  if (!res.ok) throw new Error('Failed to save state to server');
  const data = await res.json();
  return data;
}

export async function getServerPhotos(): Promise<SavedPhoto[]> {
  const res = await fetch('/api/photos');
  if (!res.ok) throw new Error('Failed to fetch photos from server');
  return res.json();
}

export async function uploadServerPhoto(photo: SavedPhoto): Promise<void> {
  const res = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo)
  });
  if (!res.ok) throw new Error('Failed to upload photo to server');
}

export async function deleteServerPhoto(id: string): Promise<void> {
  const res = await fetch(`/api/photos/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete photo from server');
}

export async function clearServerPhotos(): Promise<void> {
  const res = await fetch('/api/photos/clear', {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to clear photos from server');
}

export async function getServerWishes(): Promise<any[]> {
  const res = await fetch('/api/wishes');
  if (!res.ok) throw new Error('Failed to fetch wishes from server');
  return res.json();
}

export async function uploadServerWish(wish: { id?: string; name: string; message: string; timestamp?: number }): Promise<any> {
  const res = await fetch('/api/wishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wish)
  });
  if (!res.ok) throw new Error('Failed to post wish to server');
  return res.json();
}

export async function clearServerWishes(): Promise<void> {
  const res = await fetch('/api/wishes/clear', {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to clear wishes from server');
}

// --- Local Getters / Fallbacks ---

// Retrieve the current master password (defaulting to disha2026)
export function getAdminPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSCODE;
}

// Update the master password
export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(PASSWORD_KEY, newPassword);
  // Async sync with server
  saveServerState({ authPassword: newPassword }).catch(console.error);
}

// Check if a passcode is correct
export function verifyAdminPasscode(passcode: string): boolean {
  return passcode.trim().toLowerCase() === getAdminPassword().toLowerCase();
}

// Check if a password meets safety standards (secure password validation)
export function isPasswordSecure(password: string): { secure: boolean; feedback: string } {
  if (password.length < 6) {
    return { secure: false, feedback: 'Password is too short (minimum 6 characters required).' };
  }
  if (password.toLowerCase() === 'disha2026' || password.toLowerCase() === 'password' || password.toLowerCase() === 'admin') {
    return { secure: false, feedback: 'Please select a custom password other than the system defaults.' };
  }
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  if (!hasNumber || !hasLetter) {
    return { secure: false, feedback: 'Password must contain both letters and at least one number.' };
  }
  return { secure: true, feedback: 'Password is secure and accepted!' };
}

// Fetch the committed config from public directory (if deployed on GitHub Pages)
export async function fetchCommittedConfig(): Promise<DishaConfig | null> {
  try {
    const response = await fetch(CONFIG_URL + '?t=' + Date.now(), {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        return {
          isLocked: !!data.isLocked,
          approvedPhotoIds: Array.isArray(data.approvedPhotoIds) ? data.approvedPhotoIds : [],
          photos: Array.isArray(data.photos) ? data.photos : [],
          userInputAccessEnabled: data.userInputAccessEnabled !== false,
          msgLine1: data.msgLine1 || DEFAULT_LINE1,
          msgLine2: data.msgLine2 || DEFAULT_LINE2,
          msgLine3: data.msgLine3 || DEFAULT_LINE3,
          celebrantName: data.celebrantName || DEFAULT_CELEBRANT_NAME
        };
      }
    }
  } catch (e) {
    console.log('No committed disha-config.json found or failed to fetch. Falling back to local storage.');
  }
  return null;
}

// Local getters and setters for admin controls
export function getLocalLockState(): boolean {
  return localStorage.getItem(LOCK_KEY) === 'true';
}

export function setLocalLockState(locked: boolean): void {
  localStorage.setItem(LOCK_KEY, locked ? 'true' : 'false');
  // Async sync with server
  saveServerState({ isLocked: locked }).catch(console.error);
}

export function getLocalApprovedIds(): string[] {
  const data = localStorage.getItem(APPROVED_IDS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function setLocalApprovedIds(ids: string[]): void {
  localStorage.setItem(APPROVED_IDS_KEY, JSON.stringify(ids));
  // Async sync with server
  saveServerState({ approvedPhotoIds: ids }).catch(console.error);
}

// User Input accessibility getters/setters
export function getUserInputAccessEnabled(): boolean {
  const item = localStorage.getItem(USER_INPUT_ENABLED_KEY);
  return item === null ? true : item === 'true';
}

export function setUserInputAccessEnabled(enabled: boolean): void {
  localStorage.setItem(USER_INPUT_ENABLED_KEY, enabled ? 'true' : 'false');
  // Async sync with server
  saveServerState({ userInputAccessEnabled: enabled }).catch(console.error);
}

export function getCelebrantName(): string {
  const name = localStorage.getItem(CELEBRANT_NAME_KEY);
  return name === null ? DEFAULT_CELEBRANT_NAME : name;
}

export function setCelebrantName(name: string): void {
  localStorage.setItem(CELEBRANT_NAME_KEY, name.trim());
  // Async sync with server
  saveServerState({ celebrantName: name.trim() }).catch(console.error);
}

// Birthday messages getters/setters
export function getBirthdayMessageLines(): { line1: string; line2: string; line3: string } {
  return {
    line1: localStorage.getItem(MSG_LINE1_KEY) || DEFAULT_LINE1,
    line2: localStorage.getItem(MSG_LINE2_KEY) || DEFAULT_LINE2,
    line3: localStorage.getItem(MSG_LINE3_KEY) || DEFAULT_LINE3
  };
}

export function setBirthdayMessageLines(line1: string, line2: string, line3: string): void {
  localStorage.setItem(MSG_LINE1_KEY, line1);
  localStorage.setItem(MSG_LINE2_KEY, line2);
  localStorage.setItem(MSG_LINE3_KEY, line3);
  // Async sync with server
  saveServerState({
    msgLines: { line1, line2, line3 }
  }).catch(console.error);
}

// Generate the configuration JSON content for downloading and committing
export function generateConfigJson(
  isLocked: boolean,
  approvedPhotoIds: string[],
  photos: SavedPhoto[],
  userInputAccessEnabled: boolean,
  msgLine1: string,
  msgLine2: string,
  msgLine3: string,
  celebrantName: string
): string {
  const filteredPhotos = photos.filter(p => approvedPhotoIds.includes(p.id));
  const config: DishaConfig = {
    isLocked,
    approvedPhotoIds,
    photos: filteredPhotos,
    userInputAccessEnabled,
    msgLine1,
    msgLine2,
    msgLine3,
    celebrantName
  };
  return JSON.stringify(config, null, 2);
}
