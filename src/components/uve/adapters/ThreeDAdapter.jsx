import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SLATE_THEME } from '../slateThemeToken';

const formatNote = (note) => {
  if (note === null || note === undefined) return '';
  if (typeof note === 'object') {
    return note.text || note.label || note.value || note.annotation || JSON.stringify(note);
  }
  return String(note);
};

/**
 * 3D Cylinder Bond Component connecting two 3D atom positions
 */
const BondCylinder = ({ fromPos, toPos, color = '#94a3b8' }) => {
  const { position, rotation, height } = useMemo(() => {
    const p1 = new THREE.Vector3(...(fromPos || [0, 0, 0]));
    const p2 = new THREE.Vector3(...(toPos || [0, 0, 0]));
    const distance = p1.distanceTo(p2) || 0.1;
    const midPoint = p1.clone().add(p2).multiplyScalar(0.5);

    const orientation = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    orientation.lookAt(p1, p2, up);

    const rot = new THREE.Euler().setFromRotationMatrix(
      new THREE.Matrix4().makeRotationX(Math.PI / 2).multiply(orientation)
    );

    return {
      position: [midPoint.x, midPoint.y, midPoint.z],
      rotation: [rot.x, rot.y, rot.z],
      height: distance,
    };
  }, [fromPos, toPos]);

  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.08, 0.08, height, 16]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </mesh>
  );
};

const getCPKColor = (element, idx) => {
  const el = (element || '').toUpperCase().trim();
  switch (el) {
    case 'H': return '#f8fafc';
    case 'C': return '#334155';
    case 'N': return '#3b82f6';
    case 'O': return '#ef4444';
    case 'F': case 'CL': return '#22c55e';
    case 'BR': return '#991b1b';
    case 'I': return '#581c87';
    case 'P': return '#f97316';
    case 'S': return '#eab308';
    case 'FE': case 'ZN': case 'CU': return '#64748b';
    default:
      return SLATE_THEME.palette[idx % SLATE_THEME.palette.length];
  }
};

/**
 * 3D Molecular / Spatial Model Renderer for UVE Ecosystem
 */
export const ThreeDAdapter = React.memo(({ type, config }) => {
  const title = config?.title || '3D Scientific Model';
  const rawAtoms = config?.atoms || [];
  const rawBonds = config?.bonds || [];
  const annotations = config?.annotations || [];

  const atoms = useMemo(() => {
    if (!Array.isArray(rawAtoms)) return [];
    return rawAtoms.map((a, idx) => {
      let pos = [0, 0, 0];
      if (Array.isArray(a.position) && a.position.length >= 3) {
        pos = [parseFloat(a.position[0]) || 0, parseFloat(a.position[1]) || 0, parseFloat(a.position[2]) || 0];
      } else if (Array.isArray(a.coords) && a.coords.length >= 3) {
        pos = [parseFloat(a.coords[0]) || 0, parseFloat(a.coords[1]) || 0, parseFloat(a.coords[2]) || 0];
      } else if (a.x !== undefined || a.y !== undefined || a.z !== undefined) {
        pos = [parseFloat(a.x) || 0, parseFloat(a.y) || 0, parseFloat(a.z) || 0];
      } else {
        // Auto spherical distribution fallback if position missing
        const phi = Math.acos(-1 + (2 * idx) / Math.max(1, rawAtoms.length));
        const theta = Math.sqrt(Math.max(1, rawAtoms.length) * Math.PI) * phi;
        pos = [parseFloat((1.5 * Math.cos(theta) * Math.sin(phi)).toFixed(2)), parseFloat((1.5 * Math.sin(theta) * Math.sin(phi)).toFixed(2)), parseFloat((1.5 * Math.cos(phi)).toFixed(2))];
      }
      const radius = a.radius || (a.element === 'H' ? 0.28 : 0.42);
      const color = a.color || getCPKColor(a.element, idx);
      return { ...a, position: pos, radius, color, id: a.id || idx };
    });
  }, [rawAtoms]);

  const atomMap = useMemo(() => {
    const map = {};
    atoms.forEach((a, idx) => {
      map[a.id] = a.position;
      map[idx] = a.position;
    });
    return map;
  }, [atoms]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white p-4 relative overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 z-10">
        <div className="flex items-center gap-2">
          <span className="text-purple-600 font-bold text-sm">🧊 3D View:</span>
          <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">{title}</h4>
        </div>
        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
          Rotate with Mouse / Touch
        </span>
      </div>

      {/* 3D Canvas Container */}
      <div className="flex-1 w-full min-h-[280px] relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        {atoms.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <span className="text-2xl mb-1">🧊</span>
            <span className="text-xs font-bold uppercase text-slate-400">3D Coordinate Payload Empty</span>
            <span className="text-[10px] text-slate-500 mt-1">Spatial vertices not supplied in visual config.</span>
          </div>
        ) : (
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <directionalLight position={[-5, 5, 5]} intensity={0.8} />

            <OrbitControls enableZoom={true} enablePan={true} autoRotate={false} />

            {/* Render 3D Atom Spheres */}
            {atoms.map((atom, idx) => (
              <mesh key={`atom-${idx}`} position={atom.position}>
                <sphereGeometry args={[atom.radius || 0.35, 32, 32]} />
                <meshStandardMaterial
                  color={atom.color}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            ))}

            {/* Render 3D Bond Cylinders */}
            {rawBonds.map((bond, idx) => {
              const fromPos = atomMap[bond.from] || (atoms[bond.from] ? atoms[bond.from].position : null);
              const toPos = atomMap[bond.to] || (atoms[bond.to] ? atoms[bond.to].position : null);
              if (!fromPos || !toPos) return null;
              return <BondCylinder key={`bond-${idx}`} fromPos={fromPos} toPos={toPos} color={bond.color || '#64748b'} />;
            })}
          </Canvas>
        )}
      </div>

      {/* Annotations */}
      {annotations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 z-10">
          <span className="text-[10px] font-extrabold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
            3D Structural Notes
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

export default ThreeDAdapter;
