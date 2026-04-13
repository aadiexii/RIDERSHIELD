/**
 * HyperTrack Service — wraps hypertrack-sdk-react-native
 * Handles: initialization, device ID retrieval, start/stop tracking, trip management
 */
import HyperTrack, {
  HyperTrackError,
  Location,
  Result,
} from 'hypertrack-sdk-react-native';

const PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_HYPERTRACK_PUB_KEY ||
  'LZZLxVx_rtQKSyTb0vPnDQXCGkjAzrJVnvhJH02vtW_0rkow5hEDdgQPP0Mjb9_T4Z5yRSTbf9IO6aFtIE-J4g';

let _initialized = false;

/**
 * Initialize the HyperTrack SDK. Call once on app mount.
 */
export async function initHyperTrack(): Promise<void> {
  if (_initialized) return;
  try {
    await HyperTrack.initialize(PUBLISHABLE_KEY);
    _initialized = true;
    console.log('[HyperTrack] SDK initialized');
  } catch (err) {
    console.error('[HyperTrack] Initialization failed:', err);
  }
}

/**
 * Returns the unique HyperTrack device ID for this device.
 * Send this to the backend to link worker <-> HyperTrack device.
 */
export async function getHyperTrackDeviceId(): Promise<string | null> {
  try {
    const deviceId = await HyperTrack.getDeviceId();
    return deviceId;
  } catch (err) {
    console.error('[HyperTrack] getDeviceId failed:', err);
    return null;
  }
}

/**
 * Set the worker name so it appears on the HyperTrack dashboard.
 */
export async function setWorkerName(name: string): Promise<void> {
  try {
    await HyperTrack.setName(name);
  } catch (err) {
    console.error('[HyperTrack] setName failed:', err);
  }
}

/**
 * Set metadata (workerId, zone etc) visible on HyperTrack dashboard
 */
export async function setWorkerMetadata(meta: Record<string, string>): Promise<void> {
  try {
    await HyperTrack.setMetadata(meta);
  } catch (err) {
    console.error('[HyperTrack] setMetadata failed:', err);
  }
}

/**
 * Start tracking — tells HyperTrack to begin GPS collection.
 * Call when the worker's shift starts (app opens).
 */
export function startTracking(): void {
  try {
    HyperTrack.startTracking();
    console.log('[HyperTrack] Tracking started');
  } catch (err) {
    console.error('[HyperTrack] startTracking failed:', err);
  }
}

/**
 * Stop tracking — call when worker goes offline.
 */
export function stopTracking(): void {
  try {
    HyperTrack.stopTracking();
    console.log('[HyperTrack] Tracking stopped');
  } catch (err) {
    console.error('[HyperTrack] stopTracking failed:', err);
  }
}

/**
 * Get the current tracking state from the SDK.
 */
export async function isTracking(): Promise<boolean> {
  try {
    const result: Result<boolean, HyperTrackError[]> = await HyperTrack.isTracking();
    if (result.type === 'success') return result.value;
    return false;
  } catch {
    return false;
  }
}

/**
 * Get the real-time location from HyperTrack (not device GPS directly).
 * Returns { lat, lon } or null if unavailable.
 */
export async function getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
  try {
    const result: Result<Location, HyperTrackError[]> = await HyperTrack.getLocation();
    if (result.type === 'success') {
      return {
        lat: result.value.latitude,
        lon: result.value.longitude,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default HyperTrack;
