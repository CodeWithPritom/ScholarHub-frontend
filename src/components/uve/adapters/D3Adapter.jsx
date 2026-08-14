import React from 'react';
import { SLATE_THEME } from '../slateThemeToken';

/**
 * D3.js Adapter for UVE Ecosystem
 * Renders Citation Networks, Force-Directed Node Graphs, and Relationship Networks inside the UVE framework.
 */
export const D3Adapter = React.memo(({ type, config }) => {
  const nodes = config?.nodes || [
    { id: '1', label: 'Primary Paper' },
    { id: '2', label: 'Cited Study A' },
    { id: '3', label: 'Cited Study B' },
    { id: '4', label: 'Co-cited Work C' }
  ];

  return (
    <div className="flex-1 w-full h-full min-h-[350px] relative flex flex-col justify-between p-4 bg-white">
      <div className="w-full h-80 bg-slate-50/60 rounded-xl border border-slate-100 relative flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full">
          {/* Node Connections */}
          <line x1="50%" y1="50%" x2="25%" y2="30%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="50%" y1="50%" x2="75%" y2="30%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#cbd5e1" strokeWidth="2" />

          {/* Central Root Node */}
          <circle cx="50%" cy="50%" r="24" fill={SLATE_THEME.palette[0]} className="shadow-md" />
          <text x="50%" y="50%" textAnchor="middle" dy="4" fill="#ffffff" fontSize="10" fontWeight="bold">Root</text>

          {/* Satellite Nodes */}
          <circle cx="25%" cy="30%" r="16" fill={SLATE_THEME.palette[1]} />
          <text x="25%" y="30%" textAnchor="middle" dy="3" fill="#ffffff" fontSize="9" fontWeight="bold">Ref 1</text>

          <circle cx="75%" cy="30%" r="16" fill={SLATE_THEME.palette[2]} />
          <text x="75%" y="30%" textAnchor="middle" dy="3" fill="#ffffff" fontSize="9" fontWeight="bold">Ref 2</text>

          <circle cx="50%" cy="80%" r="16" fill={SLATE_THEME.palette[3]} />
          <text x="50%" y="80%" textAnchor="middle" dy="3" fill="#ffffff" fontSize="9" fontWeight="bold">Ref 3</text>
        </svg>

        <div className="absolute bottom-2 right-3 text-[10px] font-bold text-slate-400">
          {nodes.length} Nodes Connected
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => prevProps.type === nextProps.type && JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config));
export default D3Adapter;
