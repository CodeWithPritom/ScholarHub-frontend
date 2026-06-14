import React, { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ZoomIn, ZoomOut } from 'lucide-react';

/* ─── Image Paths (expand this array when adding more to /story/) ─── */
const IMAGES = [
 
  '/story/15.png',
  '/story/16.png',
  '/story/17.png',
  '/story/18.png',
  '/story/19.png',
  '/story/20.png',
  '/story/21.png',
  '/story/22.png',
  '/story/23.png',
  '/story/24.png',
  '/story/25.png',
  '/story/26.png',
  '/story/27.png',
  '/story/28.png',
  '/story/29.png',
  '/story/30.png',
  '/story/31.png',
  '/story/32.png',
  '/story/33.png',
  '/story/34.png',
  '/story/35.png',
  '/story/36.png',
  '/story/37.png',
  '/story/38.png',
  '/story/39.png',
  '/story/40.png',
  '/story/41.png',
  '/story/42.png',
  '/story/43.png',
  '/story/44.png',
  '/story/45.png',
  '/story/46.png',
  '/story/47.png',
  '/story/48.png',
  '/story/49.png',
  '/story/50.png',
  '/story/51.png',
  '/story/52.png',
  '/story/53.png',
];

/* ─── Fibonacci Sphere Distribution ─── */
/* Distributes N points evenly across the surface of a sphere.         */
/* This eliminates clustering and guarantees maximum spacing between    */
/* every card, utilizing the full sky, equator, and ground.            */
const RADIUS = 14;
const CARD_POSITIONS = IMAGES.map((_, i) => {
  const total = IMAGES.length;
  const phi = Math.acos(-1 + (2 * i) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;

  const x = RADIUS * Math.cos(theta) * Math.sin(phi);
  const y = RADIUS * Math.sin(theta) * Math.sin(phi);
  const z = RADIUS * Math.cos(phi);

  return { x, y, z };
});

/* ─── Single 3D Image Card with auto-aspect ratio + lookAt(0,0,0) ─── */
function Card({ imgUrl, position, onClick }) {
  const meshRef = useRef();
  const texture = useTexture(imgUrl);
  const [hovered, setHovered] = useState(false);
  const [planeArgs, setPlaneArgs] = useState([3, 4]); // default fallback

  // Detect native image dimensions and compute distortion-free plane size
  useEffect(() => {
    if (texture && texture.image) {
      const { width, height } = texture.image;
      const aspect = width / height;
      const cardHeight = 4;
      const cardWidth = cardHeight * aspect;
      setPlaneArgs([cardWidth, cardHeight]);
    }
  }, [texture]);

  // Always face the center camera, regardless of altitude
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
    }
  }, [position]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={hovered ? 1.08 : 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <planeGeometry args={planeArgs} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/* ─── 3D Cloud Gallery (cards spread across a vast sphere) ─── */
function Gallery({ onSelectImage }) {
  return (
    <group>
      {IMAGES.map((img, i) => {
        const { x, y, z } = CARD_POSITIONS[i];
        return (
          <Card
            key={`card-${i}`}
            imgUrl={img}
            position={[x, y, z]}
            onClick={() => onSelectImage(img)}
          />
        );
      })}
    </group>
  );
}

/* ─── Full-Screen Lightbox Viewer ─── */
function Lightbox({ imgSrc, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  // Zoom via mouse wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((prev) => {
      const next = prev - e.deltaY * 0.001;
      return Math.min(Math.max(next, 0.5), 5);
    });
  }, []);

  // Pan start
  const handlePointerDown = useCallback((e) => {
    if (zoom <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
  }, [zoom, position]);

  // Pan move
  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    setPosition({
      x: posStart.current.x + (e.clientX - dragStart.current.x),
      y: posStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  // Pan end
  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Reset position when zoom returns to 1
  useEffect(() => {
    if (zoom <= 1) setPosition({ x: 0, y: 0 });
  }, [zoom]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
      onWheel={handleWheel}
    >
      {/* Controls bar */}
      <div className="absolute top-6 right-6 z-[110] flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.5, 5)); }}
          className="p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
          aria-label="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.5, 0.5)); }}
          className="p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
          aria-label="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] text-white/40 text-xs font-bold uppercase tracking-[0.3em] pointer-events-none">
        {Math.round(zoom * 100)}% · Scroll to zoom
      </div>

      {/* Image container */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative max-w-[90vw] max-h-[90vh] select-none"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={imgSrc}
          alt="Full screen view"
          draggable={false}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Exported Component ─── */
export default function SuccessStories3D() {
  const navigate = useNavigate();
  const [viewingImage, setViewingImage] = useState(null);

  const handleClose = useCallback(() => {
    setViewingImage(null);
    document.body.style.cursor = 'auto';
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Back Button ─── */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-50 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-3 font-bold uppercase tracking-widest text-xs"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* ─── Header ─── */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
          Hall of Success
        </h1>
        <p className="text-white/40 font-bold tracking-[0.25em] uppercase text-[10px] md:text-xs">
          Drag to explore · Click a card to view
        </p>
      </div>

      {/* ─── R3F Canvas (inside-sphere view) ─── */}
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 80 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={1.2} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={-0.5}
          enableDamping={true}
          dampingFactor={0.05}
        />

        <Suspense fallback={<Html center><span className="text-white font-bold text-lg">Loading 3D…</span></Html>}>
          <Gallery onSelectImage={setViewingImage} />
        </Suspense>
      </Canvas>

      {/* ─── Full-Screen Lightbox ─── */}
      <AnimatePresence>
        {viewingImage && <Lightbox imgSrc={viewingImage} onClose={handleClose} />}
      </AnimatePresence>

      {/* ─── Ambient background glow ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[180px] rounded-full pointer-events-none z-0" />
    </div>
  );
}
