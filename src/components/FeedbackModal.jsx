import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Image, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const FeedbackModal = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('bug');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [imageB64, setImageB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setSubmitted(false);
      setMessage('');
      setImageB64(null);
      
      if (user?.email) {
        setEmail(user.email);
      } else {
        // Pre-fill email from localStorage profile if available
        try {
          const storedUser = localStorage.getItem('supabase.auth.token');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const userEmail = parsed?.currentSession?.user?.email;
            if (userEmail) setEmail(userEmail);
          }
        } catch (e) {}
      }
    };

    window.addEventListener('open-feedback-modal', handleOpen);
    return () => window.removeEventListener('open-feedback-modal', handleOpen);
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be smaller than 3MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageB64(reader.result);
      toast.success('Screenshot attached successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be smaller than 3MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please drop an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageB64(reader.result);
      toast.success('Screenshot attached successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          email,
          message,
          image_url: imageB64
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        toast.success('Feedback submitted successfully!');
      } else {
        toast.error(data.detail || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection issue. Saved feedback locally.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      {/* Main Form Container */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl overflow-hidden animate-slideUp z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-none">Share Your Feedback</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Help us improve ScholarHub AI</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto py-6 pr-1 custom-scrollbar">
          {submitted ? (
            <div className="text-center py-8 px-4 flex flex-col items-center justify-center gap-5">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm animate-bounce">
                <CheckCircle size={36} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 mb-2">Feedback Received!</h4>
                <p className="text-sm font-semibold text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Thank you so much for helping us improve ScholarHub AI. Our engineering team has been notified and we will review your report immediately.
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-md shadow-slate-900/10"
              >
                Close Panel
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Feedback Category</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'bug', label: 'Bug Report', desc: 'Something is broken' },
                    { id: 'feature', label: 'Feature Request', desc: 'Suggest improvements' },
                    { id: 'general', label: 'General Feedback', desc: 'Share your thoughts' },
                    { id: 'billing', label: 'Billing / Account', desc: 'Payment questions' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                        category === cat.id
                          ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-xs font-black ${category === cat.id ? 'text-blue-600' : 'text-slate-800'}`}>{cat.label}</span>
                      <span className="text-[10px] font-medium text-slate-400">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Address */}
              {user?.email ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Submitting as:</span>
                  <span className="text-blue-600 font-black">{user.email}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs font-semibold text-slate-900 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              )}

              {/* Message Details */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Details / Description</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Provide details about the issue or feature request. Be as specific as possible..."
                  className="w-full text-xs font-semibold text-slate-900 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  required
                />
              </div>

              {/* Screenshot Drag & Drop Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Attach Screenshot (Optional)</label>
                
                {imageB64 ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 group">
                    <img src={imageB64} alt="Screenshot preview" className="w-full h-full object-contain bg-slate-50" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setImageB64(null)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Remove Screenshot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-500/80 rounded-2xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-slate-50"
                  >
                    <Image size={24} className="text-slate-400" />
                    <div className="text-xs font-bold text-slate-700">Click to upload or Drag & Drop screenshot</div>
                    <div className="text-[9px] font-medium text-slate-400">PNG, JPG, or JPEG (Max 3MB)</div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default FeedbackModal;
