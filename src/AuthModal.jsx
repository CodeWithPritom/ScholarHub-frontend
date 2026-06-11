import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full h-full sm:h-auto sm:max-w-md bg-white rounded-none sm:rounded-[2rem] shadow-2xl z-[101] overflow-y-auto flex flex-col justify-center border border-slate-100"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={28} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                Please login to access personal albums and bookmark research papers.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <LogIn size={18} />
                  Login to Continue
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-50 text-slate-500 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AuthModal
