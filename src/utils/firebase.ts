import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WordArtData } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Attempt anonymous sign in safely without throwing unhandled rejection if disabled
(async () => {
  try {
    await signInAnonymously(auth);
  } catch {
    // Suppress auth/admin-restricted-operation or disabled auth errors
  }
})();

// Get or create persistent device session ID
export function getDeviceId(): string {
  const DEVICE_KEY = 'NOSTALGIA_3D_DEVICE_ID_V1';
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'dev_default_session';
  }
}

// Auto-Sync User Draft to Firestore using device ID
export async function syncDraftToFirestore(draftData: WordArtData): Promise<boolean> {
  try {
    const deviceId = getDeviceId();
    const draftDocRef = doc(db, 'user_drafts', deviceId);

    await setDoc(
      draftDocRef,
      {
        userId: deviceId,
        heading: draftData.heading || '',
        description: draftData.description || '',
        responseButtonText: draftData.responseButtonText || '',
        layout: draftData.layout || 'heart',
        colorMode: draftData.colorMode || 'multi_auto',
        words: draftData.words || [],
        title: draftData.title || '3D Word Art Draft',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('Draft sync notice:', error);
    return false;
  }
}

// Load Draft from Firestore using device ID
export async function loadDraftFromFirestore(): Promise<WordArtData | null> {
  try {
    const deviceId = getDeviceId();
    const draftDocRef = doc(db, 'user_drafts', deviceId);
    const snap = await getDoc(draftDocRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        title: data.title || 'My Custom 3D Wish ✨',
        heading: data.heading || '',
        description: data.description || '',
        responseButtonText: data.responseButtonText || '',
        layout: data.layout || 'heart',
        colorMode: data.colorMode || 'multi_auto',
        words: data.words || [],
      };
    }
  } catch (error) {
    console.warn('Draft load notice:', error);
  }
  return null;
}

// Real-time Firestore subscription for draft changes across tabs/devices
export function subscribeToDraft(onDraftUpdated: (draft: WordArtData) => void): () => void {
  try {
    const deviceId = getDeviceId();
    const draftDocRef = doc(db, 'user_drafts', deviceId);
    
    const unsubscribeSnap = onSnapshot(
      draftDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onDraftUpdated({
            title: data.title || 'My Custom 3D Wish ✨',
            heading: data.heading || '',
            description: data.description || '',
            responseButtonText: data.responseButtonText || '',
            layout: data.layout || 'heart',
            colorMode: data.colorMode || 'multi_auto',
            words: data.words || [],
          });
        }
      },
      () => {
        // Suppress listener warnings
      }
    );

    return () => {
      if (unsubscribeSnap) unsubscribeSnap();
    };
  } catch {
    return () => {};
  }
}

// Save Shared 3D Wish to Firestore
export async function saveSharedWishToFirestore(wishData: WordArtData): Promise<string | null> {
  try {
    const deviceId = getDeviceId();
    const colRef = collection(db, 'shared_wishes');

    const docRef = await addDoc(colRef, {
      creatorId: deviceId,
      heading: wishData.heading || '',
      description: wishData.description || '',
      responseButtonText: wishData.responseButtonText || '',
      layout: wishData.layout || 'heart',
      colorMode: wishData.colorMode || 'multi_auto',
      words: wishData.words || [],
      createdAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    console.warn('Save shared wish notice:', error);
    return null;
  }
}

// Get Shared 3D Wish from Firestore by ID
export async function getSharedWishFromFirestore(wishId: string): Promise<WordArtData | null> {
  try {
    const docRef = doc(db, 'shared_wishes', wishId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        title: '3D Wish Card ✨',
        heading: data.heading || '',
        description: data.description || '',
        responseButtonText: data.responseButtonText || '',
        layout: data.layout || 'heart',
        colorMode: data.colorMode || 'multi_auto',
        words: data.words || [],
      };
    }
  } catch (error) {
    console.warn('Get shared wish notice:', error);
  }
  return null;
}
