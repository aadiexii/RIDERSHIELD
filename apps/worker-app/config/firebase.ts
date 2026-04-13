import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyA-Ru5m8YVJUJZln3RttumAUgGCeWhsNmJ8',
  authDomain:        'ridershield-guidewire.firebaseapp.com',
  projectId:         'ridershield-guidewire',
  storageBucket:     'ridershield-guidewire.firebasestorage.app',
  messagingSenderId: '645888267407',
  appId:             '1:645888267407:web:b448e90244bcd2c37926fa',
  measurementId:     'G-W6KWR64387',
};

const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth, firebaseConfig };
