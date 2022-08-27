import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// this web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAUSjZKGkqttlVRi_EtNS5qGgugPio0Fbg',
  authDomain: 'next-fire-fd540.firebaseapp.com',
  projectId: 'next-fire-fd540',
  storageBucket: 'next-fire-fd540.appspot.com',
  messagingSenderId: '447403094854',
  appId: '1:447403094854:web:aae417d34ae93ea1292b47',
  measurementId: 'G-C68ZSYHQ2H',
};

let firebaseapp;

if (!getApps().length) {
  firebaseapp = initializeApp(firebaseConfig);
}

// Auth exports
export const auth = getAuth();
export const googleAuthProvider = new GoogleAuthProvider();
export const firestore = getFirestore();
export const storage = getStorage(firebaseapp);
// Helper functions
/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */

export function postsToJson(post) {
  return {
    ...post,
    // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
    createdAt: post?.createdAt.toMillis() || 0,
    updatedAt: post?.updatedAt.toMillis() || 0,
  };
}
