import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { router } from 'expo-router';

type AuthContextType = {
  workerId: string | null;
  authLoading: boolean;
  deviceFingerprint: string | null;
  login: (id: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  workerId: null,
  authLoading: true,
  deviceFingerprint: null,
  login: async () => {},
  logout: async () => {},
});

/**
 * Generates a device fingerprint from hardware-level identifiers.
 * This is stored on the backend and used for device binding verification.
 */
async function generateDeviceFingerprint(): Promise<string> {
  const parts = [
    Device.modelName || 'unknown',
    Device.osName || 'unknown',
    Device.osVersion || 'unknown',
    Device.deviceType?.toString() || '0',
    Application.applicationId || 'com.unknown',
  ];

  // On Android, the installation ID is unique per install
  try {
    const installId = await Application.getAndroidId();
    if (installId) parts.push(installId);
  } catch {}

  const raw = parts.join('|');
  // Simple hash (in production use crypto)
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `FP-${Math.abs(hash).toString(16).toUpperCase()}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      // Load saved session from Secure Storage (Android Keystore / iOS Secure Enclave)
      const storedId = await SecureStore.getItemAsync('ridershield_worker_id');
      if (storedId) setWorkerId(storedId);

      // Generate device fingerprint
      const fp = await generateDeviceFingerprint();
      setDeviceFingerprint(fp);
    } catch (err) {
      console.log('Error loading session:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (id: string, token: string) => {
    try {
      // Store in secure hardware-backed storage — not readable via ADB
      await SecureStore.setItemAsync('ridershield_worker_id', id);
      await SecureStore.setItemAsync('ridershield_worker_token', token);
      setWorkerId(id);
    } catch (err) {
      console.log('Error saving session:', err);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('ridershield_worker_id');
      await SecureStore.deleteItemAsync('ridershield_worker_token');
      setWorkerId(null);
      router.replace('/onboarding/phone');
    } catch (err) {
      console.log('Error clearing session:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ workerId, authLoading, deviceFingerprint, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
