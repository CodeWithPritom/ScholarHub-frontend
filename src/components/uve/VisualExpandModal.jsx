import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, RotateCcw, Code, Copy } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export const VisualExpandModal = ({
  isOpen,
  onClose,
  isTable,
  onShowSource,
  onCopyData,
  children
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] w-screen h-screen flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-0"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="visual-expand-modal-content relative w-full h-full bg-white flex flex-col overflow-hidden"
        >
          {/* Task 1: Slimline Workspace Header (Floating over canvas) */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-none">
            {/* Left Actions */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {onShowSource && (
                <button
                  onClick={onShowSource}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 text-xs font-bold rounded-full border border-slate-200/80 shadow-xs hover:shadow transition-all cursor-pointer"
                  title="Show Source Code"
                >
                  <Code size={14} className="text-slate-500" />
                  <span>Show code</span>
                </button>
              )}
            </div>

            {/* Right Action: Copy & Minimalist Close Button */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {onCopyData && (
                <button
                  onClick={onCopyData}
                  className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 rounded-full border border-slate-200/80 shadow-xs hover:shadow transition-all cursor-pointer"
                  title="Copy Data"
                >
                  <Copy size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 rounded-full border border-slate-200/80 shadow-xs hover:shadow transition-all cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Task 3 & 4: Edge-to-Edge Canvas Area (Zero Internal Scrollbars, Slate-50 Background, Centered) */}
          <div className="flex-1 w-full h-full relative bg-slate-50 overflow-hidden flex items-center justify-center">
            {isTable ? (
              <div className="w-full h-full overflow-auto p-8 pt-16 flex justify-center items-start">
                <div className="w-full w-full 2xl:px-12 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 overflow-x-auto">
                  {children}
                </div>
              </div>
            ) : (
              <TransformWrapper
                initialScale={1}
                minScale={0.2}
                maxScale={6}
                centerOnInit={true}
                centerZoomedOut={true}
                wheel={{ step: 0.05, smoothStep: 0.005 }}
                panning={{ disabled: false, velocityDisabled: false }}
                limitToBounds={false}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent
                      wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                      contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      wrapperClass="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
                      contentClass="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                    >
                      <div className="w-full h-full flex items-center justify-center p-8 pointer-events-auto">
                        {children}
                      </div>
                    </TransformComponent>

                    {/* Task 2: Absolute Floating Controls (Bottom-Right Vertical Pill) */}
                    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-center bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-1 gap-1">
                      <button
                        onClick={() => zoomIn()}
                        className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Zoom In"
                      >
                        <Plus size={18} />
                      </button>
                      <div className="w-5 h-px bg-slate-200/80" />
                      <button
                        onClick={() => zoomOut()}
                        className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Zoom Out"
                      >
                        <Minus size={18} />
                      </button>
                      <div className="w-5 h-px bg-slate-200/80" />
                      <button
                        onClick={() => resetTransform()}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Reset View"
                      >
                        <RotateCcw size={15} />
                      </button>
                    </div>
                  </>
                )}
              </TransformWrapper>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
