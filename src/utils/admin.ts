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

// Retrieve the current master password (defaulting to disha2026)
export function getAdminPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSCODE;
}

// Update the master password
export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(PASSWORD_KEY, newPassword);
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
}

// User Input accessibility getters/setters
export function getUserInputAccessEnabled(): boolean {
  const item = localStorage.getItem(USER_INPUT_ENABLED_KEY);
  return item === null ? true : item === 'true';
}

export function setUserInputAccessEnabled(enabled: boolean): void {
  localStorage.setItem(USER_INPUT_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function getCelebrantName(): string {
  const name = localStorage.getItem(CELEBRANT_NAME_KEY);
  return name === null ? DEFAULT_CELEBRANT_NAME : name;
}

export function setCelebrantName(name: string): void {
  localStorage.setItem(CELEBRANT_NAME_KEY, name.trim());
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
  // Only export photos that are indeed in the approved IDs or all of them depending on selection
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
