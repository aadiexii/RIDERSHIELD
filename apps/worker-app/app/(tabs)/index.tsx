import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView, Animated,
} from 'react-native';
import {
  Shield, CloudRain, Thermometer, Wind,
  ChevronRight, Bell, MapPin,
} from 'lucide-react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.119:5000'; // Real device or live deployed
// const BACKEND_URL = 'http://10.0.2.2:5000'; // Android emulator

const C = {
  bg:      '#0a0a0a',
  card:    '#0f0f0f',
  card2:   '#1a1a1a',
  orange:  '#f97316',
  white:   '#ffffff',
  gray:    '#9ca3af',
  darkGray:'#374151',
  green:   '#22c55e',
  blue:    '#3b82f6',
  red:     '#ef4444',
};

export default function HomeScreen() {
  const [weather, setWeather] = useState({
    rain: 12, temp: 34, aqi: 187,
    rainSafe: true, tempSafe: true, aqiSafe: true,
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/weather/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: 'Noida' }),
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
      .catch((err) => { console.log('Weather Poll Error:', err); });
  }, []);

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
    // Dismiss after 8 seconds automatically
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
      if (!_mounted) return;
      try {
        const res  = await fetch(`${BACKEND_URL}/worker/alerts?zoneId=Z001&since=${lastCheckedRef.current}`);
        const data = await res.json();
        if (data.alerts && data.alerts.length > 0) {
          showAlert(data.alerts[0]);
          lastCheckedRef.current = new Date().toISOString();
        }
      } catch (err) {
        console.log('Alert Poll Error:', err);
      }
    };
    pollAlerts();
    const interval = setInterval(pollAlerts, 10000);
    return () => { 
      _mounted = false;
      clearInterval(interval); 
      if (dismissTimer.current) clearTimeout(dismissTimer.current); 
    };
  }, []); // eslint-disable-line

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

      {/* ── LIVE ALERT BANNER ─────────────────────────────────────────── */}
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

        {/* ── HEADER ──────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Good morning,</Text>
            <Text style={s.name}>Rahul Kumar</Text>
          </View>
          <TouchableOpacity style={s.bellWrap}>
            <Bell color={C.gray} size={22} />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        <View style={s.locationRow}>
          <MapPin color={C.orange} size={14} />
          <Text style={s.locationText}> Noida Sector 18</Text>
          <View style={s.onlineDot} />
          <Text style={s.protectedLabel}> Protected</Text>
        </View>

        {/* ── SHIELD CARD ───────────────────────────────────── */}
        <View style={s.shieldCard}>
          <View style={s.shieldTopStripe} />
          <View style={s.shieldTopRow}>
            <Text style={s.shieldZoneLabel}>ZONE PROTECTION</Text>
            <View style={s.activePill}><Text style={s.activeText}>ACTIVE</Text></View>
          </View>
          <View style={s.shieldCenter}>
            <Shield color={C.orange} size={52} strokeWidth={1.5} />
            <Text style={s.shieldTitle}>You Are Protected</Text>
            <Text style={s.shieldSub}>Coverage active for your zone</Text>
          </View>
          <View style={s.divider} />
          <View style={s.statsRow}>
            {[{ val: 'Rs. 79', label: 'Weekly' }, { val: '8 hrs', label: 'Coverage' }, { val: 'Rs. 900', label: 'Max Payout' }].map((item, i) => (
              <View key={i} style={s.statItem}>
                <Text style={s.statVal}>{item.val}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ZONE CONDITIONS ──────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Zone Conditions</Text>
          <Text style={s.liveLabel}>Live</Text>
        </View>
        <View style={s.condRow}>
          {[
            { Icon: CloudRain,   iconColor: C.blue,   val: `${weather.rain}mm`, threshold: '<50mm',  safe: weather.rainSafe },
            { Icon: Thermometer, iconColor: C.orange,  val: `${weather.temp}°C`, threshold: '<45°C',  safe: weather.tempSafe },
            { Icon: Wind,        iconColor: C.gray,   val: `${weather.aqi}`,    threshold: '<400',   safe: weather.aqiSafe  },
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

        {/* ── RECENT PAYOUTS ──────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Payouts</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.seeAll}>See all</Text>
            <ChevronRight color={C.orange} size={14} />
          </TouchableOpacity>
        </View>

        {[
          { Icon: CloudRain,   iconBg: 'rgba(59,130,246,0.15)',  iconColor: C.blue,   type: 'Heavy Rain',   date: '28 Mar 2026', amount: 'Rs. 245' },
          { Icon: Thermometer, iconBg: 'rgba(249,115,22,0.15)', iconColor: C.orange,  type: 'Extreme Heat', date: '21 Mar 2026', amount: 'Rs. 180' },
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

        {/* ── SAFETY MODE BUTTON ───────────────────────────── */}
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
  scroll:         { flex: 1, backgroundColor: C.bg },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting:       { color: C.gray, fontSize: 13 },
  name:           { color: C.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  bellWrap:       { position: 'relative' },
  bellDot:        { position: 'absolute', top: -2, right: -2, width: 8, height: 8, backgroundColor: C.orange, borderRadius: 4 },
  locationRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 8, marginBottom: 4 },
  locationText:   { color: C.gray, fontSize: 13, marginLeft: 4 },
  onlineDot:      { width: 6, height: 6, backgroundColor: C.green, borderRadius: 3, marginLeft: 8 },
  protectedLabel: { color: C.green, fontSize: 12, marginLeft: 2 },

  shieldCard:     { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', marginHorizontal: 16, marginTop: 16, padding: 20, overflow: 'hidden' },
  shieldTopStripe:{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: C.orange },
  shieldTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shieldZoneLabel:{ color: C.orange, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  activePill:     { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  activeText:     { color: C.green, fontSize: 10, fontWeight: '700' },
  shieldCenter:   { alignItems: 'center', marginTop: 20 },
  shieldTitle:    { color: C.white, fontSize: 20, fontWeight: '800', marginTop: 12, letterSpacing: -0.3 },
  shieldSub:      { color: C.gray, fontSize: 13, marginTop: 4 },
  divider:        { height: 1, backgroundColor: C.card2, marginVertical: 16 },
  statsRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  statItem:       { flex: 1, alignItems: 'center' },
  statVal:        { color: C.white, fontSize: 16, fontWeight: '700' },
  statLabel:      { color: C.gray, fontSize: 11, marginTop: 2 },

  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  sectionTitle:   { color: C.white, fontSize: 16, fontWeight: '700' },
  liveLabel:      { color: C.green, fontSize: 12 },
  seeAll:         { color: C.orange, fontSize: 13 },

  condRow:        { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  condCard:       { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center' },
  condVal:        { color: C.white, fontSize: 18, fontWeight: '700', marginTop: 8 },
  safePill:       { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  dangerPill:     { backgroundColor: 'rgba(239,68,68,0.15)' },
  safeText:       { color: C.green, fontSize: 10, fontWeight: '600' },
  condThreshold:  { color: C.darkGray, fontSize: 10, marginTop: 4 },

  payoutRow:      { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  payoutLeft:     { flexDirection: 'row', alignItems: 'center' },
  payoutIconBox:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  payoutMeta:     { marginLeft: 12 },
  payoutType:     { color: C.white, fontSize: 14, fontWeight: '600' },
  payoutDate:     { color: C.gray, fontSize: 12, marginTop: 2 },
  payoutAmount:   { color: C.green, fontSize: 18, fontWeight: '700' },
  autoNote:       { color: C.darkGray, fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 8, marginHorizontal: 16 },

  safetyBtn:      { backgroundColor: C.orange, borderRadius: 16, marginHorizontal: 16, marginTop: 8, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  safetyMeta:     { marginLeft: 12 },
  safetyTitle:    { color: C.white, fontSize: 16, fontWeight: '700' },
  safetySub:      { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },

  // Alert banner
  alertBanner:    { backgroundColor: '#052e16', borderBottomWidth: 1, paddingVertical: 12, paddingHorizontal: 20 },
  alertInner:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  alertLeft:      { flex: 1 },
  alertPill:      { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  alertPillText:  { fontSize: 10, fontWeight: '700' },
  alertMessage:   { color: C.white, fontSize: 14, fontWeight: '600', marginTop: 4 },
  alertPayout:    { color: C.green, fontSize: 13, marginTop: 2 },
  alertZone:      { color: C.gray, fontSize: 11, marginTop: 2 },
  alertClose:     { paddingLeft: 12 },
  alertCloseText: { color: C.gray, fontSize: 22, lineHeight: 26 },
});
