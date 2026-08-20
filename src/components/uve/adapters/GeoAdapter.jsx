import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SLATE_THEME } from '../slateThemeToken';

const formatNote = (note) => {
  if (note === null || note === undefined) return '';
  if (typeof note === 'object') {
    return note.text || note.label || note.value || note.info || JSON.stringify(note);
  }
  return String(note);
};

// Custom Leaflet Pin Icon using SVG Data URL matching SDS palette
const createCustomIcon = (color = '#ef4444') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -25],
  });
};

const defaultIcon = createCustomIcon(SLATE_THEME.geo.marker);

/**
 * Geospatial Research & Institutional Mapping Adapter for UVE Ecosystem
 */
export const GeoAdapter = React.memo(({ config }) => {
  const title = config?.title || 'Geospatial Research Map';
  const rawCenter = config?.center || [20, 0];
  const zoom = typeof config?.zoom === 'number' ? config.zoom : 2;
  const rawMarkers = config?.markers || [];
  const annotations = config?.annotations || [];

  const center = useMemo(() => {
    if (Array.isArray(rawCenter) && rawCenter.length >= 2) {
      const lat = parseFloat(rawCenter[0]);
      const lng = parseFloat(rawCenter[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return [20, 0];
  }, [rawCenter]);

  const markers = useMemo(() => {
    if (!Array.isArray(rawMarkers)) return [];
    return rawMarkers
      .map((m) => {
        const lat = parseFloat(m?.lat);
        const lng = parseFloat(m?.lng);
        if (isNaN(lat) || isNaN(lng)) return null;
        return { ...m, lat, lng };
      })
      .filter(Boolean);
  }, [rawMarkers]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white p-4 relative overflow-hidden rounded-xl">
      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sky-600 font-bold text-sm">🌍 Map:</span>
          <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">{title}</h4>
        </div>
        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
          {markers.length} Locations Tagged
        </span>
      </div>

      {/* Leaflet Canvas Container */}
      <div className="flex-1 w-full min-h-[280px] relative rounded-xl border border-slate-200 overflow-hidden z-0">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', minHeight: 280 }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m, idx) => (
            <Marker key={`marker-${idx}`} position={[m.lat, m.lng]} icon={m.color ? createCustomIcon(m.color) : defaultIcon}>
              <Popup>
                <div className="p-1 min-w-[120px]">
                  <h5 className="font-bold text-xs text-slate-900 leading-tight">{formatNote(m.label || 'Research Location')}</h5>
                  {m.info && <p className="text-[11px] text-slate-600 mt-1 leading-snug">{formatNote(m.info)}</p>}
                  {m.count && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded">
                      {formatNote(m.count)} Publications
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer Annotations */}
      {annotations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
            Spatial Insights
          </span>
          {annotations.map((note, i) => (
            <span key={i} className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {formatNote(note)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config));

export default GeoAdapter;
