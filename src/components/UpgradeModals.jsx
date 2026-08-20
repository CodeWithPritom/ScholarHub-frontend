import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X, Sparkles } from 'lucide-react';

export const ForceRefreshModal = ({ isOpen, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <div 
        className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto overscroll-contain"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
          
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5">
            <RefreshCcw size={28} />
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">Force Live Refresh</h3>
          <p className="text-slate-600 font-medium mb-6 leading-relaxed text-xs sm:text-sm">
            This will clear all your cached searches and force the system to fetch the absolute latest data from the selected research repository. Your current view will be reset.
          </p>
          
          <div className="flex gap-2.5">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all uppercase tracking-widest text-[10px] cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-md shadow-blue-500/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer"
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
      <div 
        className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center z-10 overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto overscroll-contain"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-100 shrink-0">
            <Sparkles size={26} />
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
            {reason === 'limit_100' ? 'Upgrade to PRO' : 'Unlock PRO Synthesis'}
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-6">
            {reason === 'limit_100' ? (
              <>
                STARTER tier is limited to 50 articles and 50 AI summaries per day. Upgrade to <strong className="text-slate-900 font-bold">ScholarHub AI PRO</strong> for 100 results per search, 100 daily AI power-uses, and full IDE workspace capabilities.
              </>
            ) : (
              <>
                Automated Literature Reviews are exclusive to <strong className="text-slate-900 font-bold">ScholarHub AI PRO</strong> members. Upgrade your plan to get 100 results per search, 100 daily AI power-uses, and synthesize up to 15 papers simultaneously.
              </>
            )}
          </p>
          
          <div className="space-y-2.5">
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-[0.15em] rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              View Pricing Plans
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer"
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
      <div 
        className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex min-h-full items-center justify-center animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center z-10 overflow-y-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto overscroll-contain"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100 shrink-0">
            <Sparkles size={26} />
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">Upgrade to STARTER</h3>
          <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-6">
            You've hit the FREE plan limit of 15 articles per search. Upgrade to <strong className="text-slate-900 font-bold">STARTER</strong> for 50 search results, 50 AI summaries, and priority queue speeds.
          </p>
          
          <div className="space-y-2.5">
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-[0.15em] rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              View Starter Plans (from ৳199)
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
