/**
 * HyperTrack Service (HACKATHON EXPO GO SAFE MODE)
 * Mocked native wrappers to prevent Expo Go from crashing, while keeping the API signature.
 */

export async function initHyperTrack(): Promise<void> {
  console.log('[HyperTrack] SDK initialized (Mocked for Expo Go)');
}

export async function getHyperTrackDeviceId(): Promise<string | null> {
  return 'expo-go-mock-device-id-1234';
}

export async function setWorkerName(name: string): Promise<void> {
  // Mocked
}

export async function setWorkerMetadata(meta: Record<string, string>): Promise<void> {
  // Mocked
}

export function startTracking(): void {
  console.log('[HyperTrack] Tracking started (Mocked for Expo)');
}

export function stopTracking(): void {
  console.log('[HyperTrack] Tracking stopped');
}

export async function isTracking(): Promise<boolean> {
  return true;
}

export async function getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
  // Force the fallback to expo-location inside the index.tsx
  return null; 
}

export default {};
