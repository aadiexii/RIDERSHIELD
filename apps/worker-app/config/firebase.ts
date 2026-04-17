import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseCompat from 'firebase/compat/app';

const firebaseConfig = {
  apiKey:            'AIzaSyA-Ru5m8YVJUJZln3RttumAUgGCeWhsNmJ8',
  authDomain:        'ridershield-guidewire.firebaseapp.com',
  projectId:         'ridershield-guidewire',
  storageBucket:     'ridershield-guidewire.firebasestorage.app',
  messagingSenderId: '645888267407',
  appId:             '1:645888267407:web:b448e90244bcd2c37926fa',
  measurementId:     'G-W6KWR64387',
};

// Modular auth for our direct hook
const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Compat auth strictly for expo-firebase-recaptcha web support
if (firebaseCompat.apps.length === 0) {
  firebaseCompat.initializeApp(firebaseConfig);
}

export { app, auth, firebaseConfig };
