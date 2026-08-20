import React from 'react';
import { SLATE_THEME } from '../slateThemeToken';

const formatNote = (note) => {
  if (note === null || note === undefined) return '';
  if (typeof note === 'object') {
    return note.text || note.label || note.value || note.formula || note.name || JSON.stringify(note);
  }
  return String(note);
};

const getAtomColor = (element) => {
  const chem = SLATE_THEME.chemistry;
  switch (element?.toUpperCase()) {
    case 'O': return chem.oxygen;
    case 'N': return chem.nitrogen;
    case 'H': return chem.hydrogen;
    case 'S': return chem.sulfur;
    case 'P': return chem.phosphorus;
    case 'CL': return chem.chlorine;
    case 'C':
    default:
      return chem.carbon;
  }
};

/**
 * 2D Molecule & Reaction Flow Renderer for UVE Ecosystem
 */
export const ChemistryAdapter = React.memo(({ type, config }) => {
  const isReaction = type === 'reaction' || config?.reactants || config?.products;
  const title = config?.title || (isReaction ? 'Chemical Reaction Flow' : 'Molecular Structure');
  const formula = config?.formula || '';
  const weight = config?.molecular_weight || '';
  const annotations = config?.annotations || [];

  if (isReaction) {
    const reactants = config?.reactants || [];
    const products = config?.products || [];
    const catalyst = config?.catalyst || '';
    const conditions = config?.conditions || '';

    return (
      <div className="w-full h-full flex flex-col justify-between bg-white p-4 relative overflow-hidden rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-sm">🧪 Reaction:</span>
            <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">{title}</h4>
          </div>
          {conditions && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {formatNote(conditions)}
            </span>
          )}
        </div>

        {/* Reaction Equation Flow */}
        <div className="flex-1 w-full min-h-[260px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 p-6 overflow-x-auto">
          <div className="flex items-center justify-center gap-6 max-w-full">
            {/* Reactants Block */}
            <div className="flex items-center gap-3">
              {reactants.map((r, idx) => (
                <React.Fragment key={`r-${idx}`}>
                  {idx > 0 && <span className="text-xl font-bold text-slate-400">+</span>}
                  <div className="flex flex-col items-center bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-base font-black text-slate-800 font-mono">{formatNote(r.formula || r)}</span>
                    {r.name && <span className="text-[10px] font-semibold text-slate-500 mt-1">{formatNote(r.name)}</span>}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Reaction Arrow */}
            <div className="flex flex-col items-center justify-center min-w-[90px] relative">
              {catalyst && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1 border border-indigo-100">
                  {formatNote(catalyst)}
                </span>
              )}
              <div className="w-full flex items-center">
                <div className="h-0.5 bg-slate-400 flex-1" />
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-slate-600" />
              </div>
              {conditions && <span className="text-[9px] font-medium text-slate-400 mt-1">{formatNote(conditions)}</span>}
            </div>

            {/* Products Block */}
            <div className="flex items-center gap-3">
              {products.map((p, idx) => (
                <React.Fragment key={`p-${idx}`}>
                  {idx > 0 && <span className="text-xl font-bold text-slate-400">+</span>}
                  <div className="flex flex-col items-center bg-emerald-50/60 px-4 py-3 rounded-xl border border-emerald-200 shadow-xs">
                    <span className="text-base font-black text-emerald-900 font-mono">{formatNote(p.formula || p)}</span>
                    {p.name && <span className="text-[10px] font-semibold text-emerald-700 mt-1">{formatNote(p.name)}</span>}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Annotations */}
        {annotations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Mechanism Notes
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
  }

  // 2D Molecular Structure
  const rawAtoms = config?.atoms || [];
  const bonds = config?.bonds || [];

  const atoms = rawAtoms.map((a, idx) => ({
    ...a,
    x: typeof a.x === 'number' && !isNaN(a.x) ? a.x : (idx % 5) * 80 + 100,
    y: typeof a.y === 'number' && !isNaN(a.y) ? a.y : Math.floor(idx / 5) * 80 + 100,
  }));

  const atomMap = {};
  atoms.forEach((a) => (atomMap[a.id] = a));

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white p-4 relative overflow-hidden rounded-xl">
      {/* Molecule Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold text-sm">🧪 Molecule:</span>
          <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {formula && (
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
              {formatNote(formula)}
            </span>
          )}
          {weight && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {formatNote(weight)}
            </span>
          )}
        </div>
      </div>

      {/* SVG Molecular Canvas */}
      <div className="flex-1 w-full min-h-[260px] relative bg-slate-50/40 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center">
        {atoms.length === 0 ? (
          <div className="text-center text-slate-400 p-6">
            <span className="text-2xl">🧪</span>
            <p className="text-xs font-bold mt-1 text-slate-500">Molecular Formula: {formatNote(formula) || 'Unknown'}</p>
            <p className="text-[10px] text-slate-400">2D structural coordinates not supplied.</p>
          </div>
        ) : (
          <svg viewBox="0 0 600 360" className="w-full h-full max-h-[340px]" preserveAspectRatio="xMidYMid meet">
            {/* Bonds */}
            {bonds.map((bond, idx) => {
              const a1 = atomMap[bond.from];
              const a2 = atomMap[bond.to];
              if (!a1 || !a2) return null;

              const x1 = a1.x;
              const y1 = a1.y;
              const x2 = a2.x;
              const y2 = a2.y;
              const order = bond.order || 1;

              if (order === 2) {
                const dx = y2 - y1;
                const dy = x1 - x2;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const offset = 3;
                const nx = (dx / len) * offset;
                const ny = (dy / len) * offset;

                return (
                  <g key={`bond-${idx}`}>
                    <line x1={x1 + nx} y1={y1 + ny} x2={x2 + nx} y2={y2 + ny} stroke={SLATE_THEME.chemistry.bond} strokeWidth="2.5" />
                    <line x1={x1 - nx} y1={y1 - ny} x2={x2 - nx} y2={y2 - ny} stroke={SLATE_THEME.chemistry.bond} strokeWidth="2.5" />
                  </g>
                );
              }

              return (
                <line
                  key={`bond-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={SLATE_THEME.chemistry.bond}
                  strokeWidth={order === 3 ? "4" : "2.5"}
                  strokeDasharray={bond.aromatic ? "4,3" : undefined}
                />
              );
            })}

            {/* Atom Nodes */}
            {atoms.map((atom) => {
              const color = getAtomColor(atom.element);
              const isCarbon = atom.element?.toUpperCase() === 'C';

              return (
                <g key={atom.id} transform={`translate(${atom.x}, ${atom.y})`}>
                  <circle cx="0" cy="0" r={isCarbon ? "14" : "16"} fill="#ffffff" stroke={color} strokeWidth="2.5" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={color}
                    fontSize={isCarbon ? "11" : "12"}
                    fontFamily={SLATE_THEME.fontFamily.sans}
                    fontWeight="800"
                  >
                    {atom.element}
                  </text>
                  {atom.charge && (
                    <text x="12" y="-8" fill={color} fontSize="9" fontWeight="bold">
                      {formatNote(atom.charge)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Annotations */}
      {annotations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            Pharmacology / Properties
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
}, (prevProps, nextProps) => prevProps.type === nextProps.type && JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config));

export default ChemistryAdapter;
