import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView, Animated,
} from 'react-native';
import {
  Shield, CloudRain, Thermometer, Wind,
  ChevronRight, Bell, MapPin,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from '../../context/AuthContext';
import {
  initHyperTrack,
  getHyperTrackDeviceId,
  setWorkerName,
  setWorkerMetadata,
  startTracking,
  getCurrentLocation,
} from '../../services/hypertrack';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.126:5000';

// NCR zone coordinate bounding boxes — used for GPS zone detection
const ZONE_BOUNDS = [
  { id: 'Z001', name: 'Noida Sector 18',    latMin: 28.56, latMax: 28.58, lonMin: 77.31, lonMax: 77.33 },
  { id: 'Z002', name: 'Delhi Rohini',       latMin: 28.69, latMax: 28.75, lonMin: 77.09, lonMax: 77.13 },
  { id: 'Z003', name: 'Gurugram Sector 45', latMin: 28.43, latMax: 28.46, lonMin: 77.05, lonMax: 77.09 },
];

const findZoneFromCoords = (lat: number, lon: number) => {
  return ZONE_BOUNDS.find(z =>
    lat >= z.latMin && lat <= z.latMax &&
    lon >= z.lonMin && lon <= z.lonMax
  );
};

const C = {
  bg: '#0a0a0a', card: '#0f0f0f', card2: '#1a1a1a',
  orange: '#f97316', white: '#ffffff', gray: '#9ca3af',
  darkGray: '#374151', green: '#22c55e', blue: '#3b82f6', red: '#ef4444',
};

export default function HomeScreen() {
  const { workerId } = useAuth();
  const [weather, setWeather] = useState({
    rain: 12, temp: 34, aqi: 187,
    rainSafe: true, tempSafe: true, aqiSafe: true,
  });
  const [zone, setZone] = useState('Noida Sector 18');
  const [inZone, setInZone] = useState(true);
  const [gpsTrackingActive, setGpsTrackingActive] = useState(false);

  const checkZone = (coords: { latitude: number, longitude: number }) => {
    const match = findZoneFromCoords(coords.latitude, coords.longitude);
    if (match) {
      setZone(match.name);
      setInZone(true);
    } else {
      setInZone(false);
    }
  };

  // ── HyperTrack Continuous Tracking ────────────────────────────────────────
  useEffect(() => {
    if (!workerId) return;

    (async () => {
      // 1. Initialize HyperTrack SDK
      await initHyperTrack();

      // 2. Get the unique HyperTrack device ID for this device
      const deviceId = await getHyperTrackDeviceId();
      console.log('[HyperTrack] Device ID:', deviceId);

      // 3. Push device ID to our backend so we can link worker <-> HyperTrack
      if (deviceId) {
        fetch(`${BACKEND_URL}/worker/hypertrack-device`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workerId, hypertrackDeviceId: deviceId }),
        }).catch(console.log);
      }

      // 4. Tag the device on HyperTrack dashboard with worker info
      await setWorkerName(`RiderShield Worker ${workerId}`);
      await setWorkerMetadata({ workerId, platform: 'RiderShield', zone: 'Noida Sector 18' });

      // 5. Start tracking — SDK takes over, appears on HyperTrack live map
      startTracking();
      setGpsTrackingActive(true);

      // 6. Also get current location for zone detection
      const loc = await getCurrentLocation();
      if (loc) {
        checkZone({ latitude: loc.lat, longitude: loc.lon });
        // Sync to our DB as well
        fetch(`${BACKEND_URL}/worker/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workerId, lat: loc.lat, lon: loc.lon }),
        }).catch(console.log);
      } else {
        // Fallback to expo-location for zone detection only (not tracking)
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const fallback = await Location.getCurrentPositionAsync({});
          checkZone(fallback.coords);
        }
      }
    })();
  }, [workerId]);


  // ── Expo Push Notification setup ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if(!workerId) return;
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        const pushToken = tokenData.data;
        await fetch(`${BACKEND_URL}/worker/push-token`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ workerId, pushToken }),
        });
      } catch (err) {
        console.log('Push token error:', err);
      }
    })();
  }, [workerId]);

  // ── Weather polling ────────────────────────────────────────────────────────
  useEffect(() => {
    const city = zone.split(' ')[0];
    fetch(`${BACKEND_URL}/weather/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: city || 'Noida' }),
    })
      .then(r => r.json())
      .then(data => setWeather({
        rain:     data.rain_mm || 12,
        temp:     data.temp || 34,
        aqi:      Math.round((data.severity_score || 0.2) * 500),
        rainSafe: (data.rain_mm || 0) < 50,
        tempSafe: (data.temp || 34) < 45,
        aqiSafe:  true,
      }))
      .catch(() => {});
  }, [zone]);

  // ── Alert polling ──────────────────────────────────────────────────────────
  const [activeAlert,   setActiveAlert]   = useState<any>(null);
  const [alertVisible,  setAlertVisible]  = useState(false);
  const lastCheckedRef = useRef(new Date().toISOString());
  const alertAnim = useRef(new Animated.Value(-120)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (alert: any) => {
    setActiveAlert(alert);
    setAlertVisible(true);
    Animated.timing(alertAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(dismissAlert, 8000);
  };

  const dismissAlert = () => {
    Animated.timing(alertAnim, { toValue: -120, duration: 300, useNativeDriver: true }).start(() =>
      setAlertVisible(false)
    );
  };

  useEffect(() => {
    let _mounted = true;
    const pollAlerts = async () => {
      if (!_mounted || !workerId) return;
      try {
        const res  = await fetch(`${BACKEND_URL}/worker/alerts?zoneId=Z001&since=${lastCheckedRef.current}`);
        const data = await res.json();
        if (data.alerts && data.alerts.length > 0) {
          showAlert(data.alerts[0]);
          lastCheckedRef.current = new Date().toISOString();
        }
      } catch {}
    };
    pollAlerts();
    const interval = setInterval(pollAlerts, 10000);
    return () => {
      _mounted = false;
      clearInterval(interval);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [workerId]);

  const [workerName, setWorkerName] = useState('Worker');
  useEffect(() => {
    if (!workerId) return;
    fetch(`${BACKEND_URL}/worker/profile/${workerId}`)
      .then(r => r.json())
      .then(d => { if (d.name) setWorkerName(d.name.split(' ')[0]); })
      .catch(() => {});
  }, [workerId]);

  const TYPE_BG: Record<string, string> = {
    rain: 'rgba(59,130,246,0.2)', heat: 'rgba(249,115,22,0.2)',
    smog: 'rgba(156,163,175,0.2)', flood: 'rgba(6,182,212,0.2)', curfew: 'rgba(239,68,68,0.2)',
  };
  const TYPE_COLOR: Record<string, string> = {
    rain: C.blue, heat: C.orange, smog: C.gray, flood: '#06b6d4', curfew: C.red,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {alertVisible && activeAlert && (
        <Animated.View
          style={[
            s.alertBanner,
            { borderBottomColor: activeAlert.status === 'credited' ? C.green : C.red },
            { transform: [{ translateY: alertAnim }] },
          ]}
        >
          <View style={s.alertInner}>
            <View style={s.alertLeft}>
              <View style={[s.alertPill, { backgroundColor: TYPE_BG[activeAlert.disruptionType] || 'rgba(249,115,22,0.2)' }]}>
                <Text style={[s.alertPillText, { color: TYPE_COLOR[activeAlert.disruptionType] || C.orange }]}>
                  {(activeAlert.disruptionType || '').toUpperCase()}
                </Text>
              </View>
              <Text style={s.alertMessage}>{activeAlert.message}</Text>
              <Text style={s.alertPayout}>{activeAlert.payoutMessage}</Text>
              <Text style={s.alertZone}>{activeAlert.zoneName}</Text>
            </View>
            <TouchableOpacity onPress={dismissAlert} style={s.alertClose}>
              <Text style={s.alertCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</Text>
            <Text style={s.name}>{workerName}</Text>
          </View>
          <TouchableOpacity style={s.bellWrap}>
            <Bell color={C.gray} size={22} />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        <View style={s.zoneCard}>
          <MapPin color={inZone ? C.green : C.orange} size={28} />
          <View style={s.zoneMeta}>
            <Text style={s.zoneTitle}>{zone}</Text>
            <Text style={s.zoneStatus}>{inZone ? 'Inside Covered Zone' : 'Outside Target Zone'}</Text>
          </View>
        </View>

        {gpsTrackingActive && (
          <View style={s.trackingBanner}>
            <View style={s.radarBlip} />
            <Text style={s.trackingText}>Live Route Tracking Active</Text>
          </View>
        )}

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Zone Conditions</Text>
          <Text style={s.liveLabel}>Live</Text>
        </View>
        <View style={s.condRow}>
          {[
            { Icon: CloudRain,   iconColor: C.blue,  val: `${weather.rain}mm`, threshold: '<50mm', safe: weather.rainSafe },
            { Icon: Thermometer, iconColor: C.orange, val: `${weather.temp}°C`, threshold: '<45°C', safe: weather.tempSafe },
            { Icon: Wind,        iconColor: C.gray,  val: `${weather.aqi}`,    threshold: '<400',  safe: weather.aqiSafe  },
          ].map(({ Icon, iconColor, val, threshold, safe }, i) => (
            <View key={i} style={s.condCard}>
              <Icon color={iconColor} size={24} />
              <Text style={s.condVal}>{val}</Text>
              <View style={[s.safePill, !safe && s.dangerPill]}>
                <Text style={[s.safeText, !safe && { color: C.red }]}>{safe ? 'Safe' : 'Alert'}</Text>
              </View>
              <Text style={s.condThreshold}>{threshold}</Text>
            </View>
          ))}
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Payouts</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.seeAll}>See all</Text>
            <ChevronRight color={C.orange} size={14} />
          </TouchableOpacity>
        </View>

        {[
          { Icon: CloudRain,   iconBg: 'rgba(59,130,246,0.15)', iconColor: C.blue,   type: 'Heavy Rain',   date: '28 Mar 2026', amount: 'Rs. 245' },
          { Icon: Thermometer, iconBg: 'rgba(249,115,22,0.15)', iconColor: C.orange, type: 'Extreme Heat', date: '21 Mar 2026', amount: 'Rs. 180' },
          { Icon: Wind,        iconBg: 'rgba(156,163,175,0.15)',iconColor: C.gray,   type: 'High AQI',     date: '14 Mar 2026', amount: 'Rs. 210' },
        ].map(({ Icon, iconBg, iconColor, type, date, amount }, i) => (
          <View key={i} style={s.payoutRow}>
            <View style={s.payoutLeft}>
              <View style={[s.payoutIconBox, { backgroundColor: iconBg }]}><Icon color={iconColor} size={18} /></View>
              <View style={s.payoutMeta}>
                <Text style={s.payoutType}>{type}</Text>
                <Text style={s.payoutDate}>{date}</Text>
              </View>
            </View>
            <Text style={s.payoutAmount}>{amount}</Text>
          </View>
        ))}

        <Text style={s.autoNote}>All payouts credited automatically — 0 claims filed</Text>

        <TouchableOpacity style={s.safetyBtn} activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Shield color={C.white} size={24} />
            <View style={s.safetyMeta}>
              <Text style={s.safetyTitle}>Safety Mode</Text>
              <Text style={s.safetySub}>For curfews and emergencies</Text>
            </View>
          </View>
          <ChevronRight color={C.white} size={20} />
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll:          { flex: 1, backgroundColor: C.bg },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting:        { color: C.gray, fontSize: 13 },
  name:            { color: C.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  bellWrap:        { position: 'relative' },
  bellDot:         { position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: C.orange, borderRadius: 4 },
  zoneCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, padding: 16, borderRadius: 16, marginTop: 16 },
  zoneMeta:        { marginLeft: 12 },
  zoneTitle:       { color: C.white, fontSize: 18, fontWeight: '700' },
  zoneStatus:      { color: C.gray, fontSize: 13, marginTop: 2 },
  trackingBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', borderRadius: 12, padding: 12, marginHorizontal: 16, marginTop: 16 },
  radarBlip:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green, marginRight: 10 },
  trackingText:    { color: C.green, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  sectionTitle:    { color: C.white, fontSize: 16, fontWeight: '700' },
  liveLabel:       { color: C.green, fontSize: 12 },
  seeAll:          { color: C.orange, fontSize: 13 },
  condRow:         { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  condCard:        { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center' },
  condVal:         { color: C.white, fontSize: 18, fontWeight: '700', marginTop: 8 },
  safePill:        { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  dangerPill:      { backgroundColor: 'rgba(239,68,68,0.15)' },
  safeText:        { color: C.green, fontSize: 10, fontWeight: '600' },
  condThreshold:   { color: C.darkGray, fontSize: 10, marginTop: 4 },
  payoutRow:       { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  payoutLeft:      { flexDirection: 'row', alignItems: 'center' },
  payoutIconBox:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  payoutMeta:      { marginLeft: 12 },
  payoutType:      { color: C.white, fontSize: 14, fontWeight: '600' },
  payoutDate:      { color: C.gray, fontSize: 12, marginTop: 2 },
  payoutAmount:    { color: C.green, fontSize: 18, fontWeight: '700' },
  autoNote:        { color: C.darkGray, fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 8, marginHorizontal: 16 },
  safetyBtn:       { backgroundColor: C.orange, borderRadius: 16, marginHorizontal: 16, marginTop: 8, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  safetyMeta:      { marginLeft: 12 },
  safetyTitle:     { color: C.white, fontSize: 16, fontWeight: '700' },
  safetySub:       { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  alertBanner:     { backgroundColor: '#052e16', borderBottomWidth: 1, paddingVertical: 12, paddingHorizontal: 20 },
  alertInner:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  alertLeft:       { flex: 1 },
  alertPill:       { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  alertPillText:   { fontSize: 10, fontWeight: '700' },
  alertMessage:    { color: C.white, fontSize: 14, fontWeight: '600', marginTop: 4 },
  alertPayout:     { color: C.green, fontSize: 13, marginTop: 2 },
  alertZone:       { color: C.gray, fontSize: 11, marginTop: 2 },
  alertClose:      { paddingLeft: 12 },
  alertCloseText:  { color: C.gray, fontSize: 22, lineHeight: 26 },
});
