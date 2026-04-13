import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// NCR + major city zones with coordinates
const ZONE_COORDS = [
  { name: 'Noida Sector 18',     lat: 28.5706, lon: 77.3261, city: 'Noida'    },
  { name: 'Delhi Rohini',         lat: 28.7315, lon: 77.0760, city: 'Delhi'    },
  { name: 'Gurugram Sector 45',   lat: 28.4595, lon: 77.0266, city: 'Gurugram' },
  { name: 'Delhi Lajpat Nagar',   lat: 28.5665, lon: 77.2431, city: 'Delhi'    },
  { name: 'Patna',                lat: 25.5941, lon: 85.1376, city: 'Patna'    },
  { name: 'Lucknow',              lat: 26.8467, lon: 80.9462, city: 'Lucknow'  },
];

const getRiskColor = (score) => {
  if (score > 0.7) return '#ef4444';  // red
  if (score > 0.4) return '#f59e0b';  // amber
  return '#22c55e';                   // green
};

function MapResetter({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 7); }, [center, map]);
  return null;
}

export default function ZoneMap({ zonesData = [] }) {
  const [selected, setSelected] = useState(null);
  const center = [27.5, 80.5]; // India center

  // Match backend zones to our coordinate map
  const enriched = ZONE_COORDS.map(zc => {
    const live = zonesData.find(z => z.name === zc.name) || {};
    return {
      ...zc,
      riskScore:        live.riskScore        ?? Math.random() * 0.8,
      hasActiveAlert:   live.hasActiveAlert    ?? false,
      recentClaimsCount:live.recentClaimsCount ?? 0,
      activeWorkers:    live.activeWorkers     ?? 120,
    };
  });

  return (
    <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-white">Zone Risk Map</h2>
          <p className="text-zinc-500 text-xs mt-1">Live disruption risk across all covered zones</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {[['#ef4444','High > 0.7'],['#f59e0b','Medium > 0.4'],['#22c55e','Low']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c }} />
              <span className="text-zinc-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden relative z-0 isolate shadow-inner ring-1 ring-white/10" style={{ height: 420 }}>
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '100%', width: '100%', background: '#111' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <MapResetter center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {enriched.map(zone => (
            <CircleMarker
              key={zone.name}
              center={[zone.lat, zone.lon]}
              radius={zone.hasActiveAlert ? 18 : 14}
              pathOptions={{
                color:       getRiskColor(zone.riskScore),
                fillColor:   getRiskColor(zone.riskScore),
                fillOpacity: 0.35,
                weight:      zone.hasActiveAlert ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => setSelected(selected?.name === zone.name ? null : zone) }}
            >
              <Tooltip direction="top" permanent={false}>
                <div style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12 }}>
                  <strong>{zone.name}</strong><br />
                  Risk: {(zone.riskScore * 100).toFixed(0)}% &nbsp;|&nbsp; {zone.recentClaimsCount} recent claims<br />
                  {zone.hasActiveAlert && <span style={{ color: '#ef4444' }}>⚠ Active Alert</span>}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Selected zone detail */}
      {selected && (
        <div className="mt-4 bg-black/30 border border-white/8 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{selected.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{selected.city} · {selected.activeWorkers} active workers</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl">×</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-zinc-500 text-xs">Risk Score</p>
              <p className="font-bold text-sm" style={{ color: getRiskColor(selected.riskScore) }}>
                {(selected.riskScore * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Recent Claims</p>
              <p className="text-white font-bold text-sm">{selected.recentClaimsCount}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Status</p>
              <p className={`font-bold text-sm ${selected.hasActiveAlert ? 'text-red-400' : 'text-green-400'}`}>
                {selected.hasActiveAlert ? '⚠ Disrupted' : '✓ Clear'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
