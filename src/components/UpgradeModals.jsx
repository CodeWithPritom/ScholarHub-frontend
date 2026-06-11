import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X, Sparkles } from 'lucide-react';

export const ForceRefreshModal = ({ isOpen, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full h-full sm:h-auto max-w-md rounded-none sm:rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 overflow-y-auto flex flex-col justify-center max-h-screen sm:max-h-[85vh]"
        >
          <div className="absolute top-0 right-0 p-6">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <RefreshCcw size={32} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Force Live Refresh</h3>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">
            This will clear all your cached searches and force the system to fetch the absolute latest data from the selected research repository. Your current view will be reset.
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-200 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
            >
              <RefreshCcw size={14} />
              Proceed
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const ProUpgradeModal = ({ isOpen, onClose, navigate, reason }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full h-full sm:h-auto max-w-md bg-white rounded-none sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 text-center z-10 overflow-y-auto flex flex-col justify-center max-h-screen sm:max-h-[85vh]"
        >
          <div className="absolute top-0 right-0 p-6">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100 shrink-0">
            <Sparkles size={28} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            {reason === 'limit_100' ? 'Upgrade to PRO' : 'Unlock PRO Synthesis'}
          </h3>
          <p className="text-slate-500 text-sm font-semibold leading-relaxed mb-8">
            {reason === 'limit_100' ? (
              <>
                STARTER tier is limited to 50 articles. Upgrade to <strong className="text-slate-900 font-bold">ScholarHub AI PRO</strong> for unlimited access and search up to 100 articles.
              </>
            ) : (
              <>
                Automated Literature Reviews are exclusive to <strong className="text-slate-900 font-bold">ScholarHub AI PRO</strong> members. Upgrade your plan to synthesize up to 15 papers simultaneously with headings (Introduction, Methodology, Gaps, and Conclusion).
              </>
            )}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-100 hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              View Pricing Plans
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const StarterUpgradeModal = ({ isOpen, onClose, navigate }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full h-full sm:h-auto max-w-md bg-white rounded-none sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 text-center z-10 overflow-y-auto flex flex-col justify-center max-h-screen sm:max-h-[85vh]"
        >
          <div className="absolute top-0 right-0 p-6">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shrink-0">
            <Sparkles size={28} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Upgrade to STARTER</h3>
          <p className="text-slate-500 text-sm font-semibold leading-relaxed mb-8">
            Advanced search filters and higher article fetch limits are exclusive to <strong className="text-slate-900 font-bold">ScholarHub AI STARTER</strong> or PRO members. Upgrade your plan to get advanced filtering (by date and sorting) and fetch up to 50 articles.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="w-full py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              View Pricing Plans
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
