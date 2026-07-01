import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('scholarhub_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('scholarhub_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-[calc(100%-3rem)] sm:w-auto bg-white/80 backdrop-blur-md border border-slate-200 p-5 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out">
      <p className="text-[13px] font-medium text-slate-600 leading-relaxed mb-4">
        We use cookies to personalize your research discovery and analyze traffic.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={handleAccept}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          Accept
        </button>
        <a href="/privacy" className="text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-4">
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default CookieBanner;
