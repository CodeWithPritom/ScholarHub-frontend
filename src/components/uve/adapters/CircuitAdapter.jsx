import React, { useMemo } from 'react';
import { SLATE_THEME } from '../slateThemeToken';

// Safe annotation text formatter
const formatNote = (note) => {
  if (note === null || note === undefined) return '';
  if (typeof note === 'object') {
    return note.text || note.label || note.value || note.annotation || JSON.stringify(note);
  }
  return String(note);
};

/**
 * Custom SVG Component Renderers for Electronic Symbols
 */
const RenderComponentSymbol = ({ type, x, y, label, id, isHighlight }) => {
  const theme = SLATE_THEME.circuit;
  const strokeColor = isHighlight ? theme.highlight : theme.component;
  const strokeWidth = 2.5;

  const posX = typeof x === 'number' && !isNaN(x) ? x : 100;
  const posY = typeof y === 'number' && !isNaN(y) ? y : 100;

  switch (type?.toLowerCase()) {
    case 'resistor':
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <line x1="-30" y1="0" x2="-18" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="18" y1="0" x2="30" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <polyline
            points="-18,0 -13,-10 -5,10 3,-10 11,10 18,0"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <text x="0" y="-16" textAnchor="middle" fill={theme.label} fontSize="11" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="600">
            {label || id}
          </text>
        </g>
      );

    case 'capacitor':
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <line x1="-30" y1="0" x2="-6" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="6" y1="0" x2="30" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="-6" y1="-14" x2="-6" y2="14" stroke={strokeColor} strokeWidth={strokeWidth + 0.5} />
          <line x1="6" y1="-14" x2="6" y2="14" stroke={strokeColor} strokeWidth={strokeWidth + 0.5} />
          <text x="0" y="-20" textAnchor="middle" fill={theme.label} fontSize="11" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="600">
            {label || id}
          </text>
        </g>
      );

    case 'inductor':
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <line x1="-30" y1="0" x2="-20" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="20" y1="0" x2="30" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <path d="M -20,0 A 5,5 0 0,1 -10,0 A 5,5 0 0,1 0,0 A 5,5 0 0,1 10,0 A 5,5 0 0,1 20,0" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
          <text x="0" y="-16" textAnchor="middle" fill={theme.label} fontSize="11" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="600">
            {label || id}
          </text>
        </g>
      );

    case 'voltage_source':
    case 'source':
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <line x1="0" y1="-30" x2="0" y2="-18" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="0" y1="18" x2="0" y2="30" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="0" cy="0" r="18" fill="#ffffff" stroke={strokeColor} strokeWidth={strokeWidth} />
          <text x="0" y="-5" textAnchor="middle" fill={strokeColor} fontSize="12" fontWeight="bold">+</text>
          <text x="0" y="11" textAnchor="middle" fill={strokeColor} fontSize="12" fontWeight="bold">-</text>
          <text x="24" y="4" textAnchor="start" fill={theme.label} fontSize="11" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="600">
            {label || id}
          </text>
        </g>
      );

    case 'ground':
    case 'gnd':
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <line x1="0" y1="-15" x2="0" y2="0" stroke={theme.ground} strokeWidth={strokeWidth} />
          <line x1="-16" y1="0" x2="16" y2="0" stroke={theme.ground} strokeWidth={strokeWidth} />
          <line x1="-10" y1="5" x2="10" y2="5" stroke={theme.ground} strokeWidth={strokeWidth} />
          <line x1="-4" y1="10" x2="4" y2="10" stroke={theme.ground} strokeWidth={strokeWidth} />
        </g>
      );

    case 'diode':
    case 'led':
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <line x1="-30" y1="0" x2="30" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <polygon points="-10,-12 -10,12 10,0" fill={strokeColor} />
          <line x1="10" y1="-12" x2="10" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} />
          {type.toLowerCase() === 'led' && (
            <>
              <line x1="4" y1="-14" x2="12" y2="-22" stroke={theme.highlight} strokeWidth="1.5" />
              <line x1="-2" y1="-14" x2="6" y2="-22" stroke={theme.highlight} strokeWidth="1.5" />
            </>
          )}
          <text x="0" y="-18" textAnchor="middle" fill={theme.label} fontSize="11" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="600">
            {label || id}
          </text>
        </g>
      );

    case 'op_amp':
    case 'opamp':
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <polygon points="-25,-25 -25,25 25,0" fill="#ffffff" stroke={strokeColor} strokeWidth={strokeWidth} />
          <text x="-18" y="-8" fill={strokeColor} fontSize="12" fontWeight="bold">-</text>
          <text x="-18" y="14" fill={strokeColor} fontSize="12" fontWeight="bold">+</text>
          <line x1="-35" y1="-12" x2="-25" y2="-12" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="-35" y1="12" x2="-25" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="25" y1="0" x2="35" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
          <text x="0" y="-30" textAnchor="middle" fill={theme.label} fontSize="11" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="600">
            {label || id}
          </text>
        </g>
      );

    default:
      return (
        <g transform={`translate(${posX}, ${posY})`}>
          <rect x="-24" y="-14" width="48" height="28" rx="6" fill="#ffffff" stroke={strokeColor} strokeWidth={strokeWidth} />
          <text x="0" y="4" textAnchor="middle" fill={SLATE_THEME.text.primary} fontSize="10" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="bold">
            {label || id}
          </text>
        </g>
      );
  }
};

/**
 * Circuit Schematic Adapter Component for UVE Ecosystem
 */
export const CircuitAdapter = React.memo(({ config }) => {
  const title = config?.title || 'Electronic Circuit Schematic';
  const rawComponents = config?.components || [];
  const rawConnections = config?.connections || [];
  const annotations = config?.annotations || [];

  // Auto-assign positions if missing
  const formattedComponents = useMemo(() => {
    return rawComponents.map((c, idx) => {
      const posX = typeof c.x === 'number' && !isNaN(c.x) ? c.x : (idx % 4) * 150 + 100;
      const posY = typeof c.y === 'number' && !isNaN(c.y) ? c.y : Math.floor(idx / 4) * 120 + 150;
      return { ...c, x: posX, y: posY };
    });
  }, [rawComponents]);

  // Map components by ID
  const compMap = useMemo(() => {
    const map = {};
    formattedComponents.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [formattedComponents]);

  if (!formattedComponents || formattedComponents.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-6 text-center rounded-xl border border-slate-200">
        <span className="text-2xl mb-2">⚡</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Empty Circuit Schematic</span>
        <span className="text-[11px] text-slate-400 mt-1">No component definitions found in payload.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white p-4 relative overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-sm">⚡ Schematic:</span>
          <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">{title}</h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {formattedComponents.length} Components
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 w-full min-h-[280px] relative bg-slate-50/40 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 700 400" className="w-full h-full max-h-[360px]" preserveAspectRatio="xMidYMid meet">
          {/* Wire Connections */}
          {rawConnections.map((conn, idx) => {
            const fromComp = compMap[conn.from];
            const toComp = compMap[conn.to];
            if (!fromComp || !toComp) return null;

            const x1 = typeof fromComp.x === 'number' && !isNaN(fromComp.x) ? fromComp.x : 100;
            const y1 = typeof fromComp.y === 'number' && !isNaN(fromComp.y) ? fromComp.y : 100;
            const x2 = typeof toComp.x === 'number' && !isNaN(toComp.x) ? toComp.x : 300;
            const y2 = typeof toComp.y === 'number' && !isNaN(toComp.y) ? toComp.y : 200;
            const midX = (x1 + x2) / 2;

            return (
              <g key={`conn-${idx}`}>
                <path
                  d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
                  fill="none"
                  stroke={SLATE_THEME.circuit.wire}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {conn.label && (
                  <text x={midX + 4} y={(y1 + y2) / 2 - 4} fill={SLATE_THEME.circuit.highlight} fontSize="10" fontFamily={SLATE_THEME.fontFamily.mono} fontWeight="bold">
                    {formatNote(conn.label)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Component Symbols */}
          {formattedComponents.map((comp) => (
            <RenderComponentSymbol
              key={comp.id}
              id={comp.id}
              type={comp.type}
              x={comp.x}
              y={comp.y}
              label={formatNote(comp.label)}
              isHighlight={comp.highlight}
            />
          ))}
        </svg>
      </div>

      {/* Annotations & Formulas Bar */}
      {annotations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Key Metrics
          </span>
          {annotations.map((note, i) => (
            <span key={i} className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
              {formatNote(note)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config));

export default CircuitAdapter;
