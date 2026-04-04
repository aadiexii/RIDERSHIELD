import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyA-Ru5m8YVJUJZln3RtumAUgGCeWhsNmJ8',
  authDomain:        'ridershield-guidewire.firebaseapp.com',
  projectId:         'ridershield-guidewire',
  storageBucket:     'ridershield-guidewire.firebasestorage.app',
  messagingSenderId: '645880267407',
  appId:             '1:645880267407:web:b448e90244bcd2c37926fa',
  measurementId:     'G-W6KWRG4387',
};

const app = initializeApp(firebaseConfig);

export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('email');
googleProvider.addScope('profile');
