import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface ActiveAd {
  id: number;
  title: string;
  image: string;
  link: string | null;
}

const AdPopup: React.FC = () => {
  const [ad, setAd] = useState<ActiveAd | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the ad in this session
    const hasSeenAd = sessionStorage.getItem('med_ad_displayed');
    if (hasSeenAd) return;

    fetch('http://localhost:8000/api/products/active-ad/')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('No active ad');
      })
      .then((data) => {
        if (data && data.image) {
          setAd(data);
          // Show popup after a 1.5-second pleasant transition delay
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {
        // No active ad or server offline, fail silently
      });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('med_ad_displayed', 'true');
  };

  if (!ad || !isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[3px] z-50 flex items-center justify-center p-4 animate-fade-in transition-all duration-300">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full relative shadow-2xl border border-slate-100 hover:scale-[1.005] transition-all-300 flex flex-col">
        {/* Header Close button bar */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100">
          <span className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">Special Announcement</span>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-red-500 hover:bg-slate-50 p-1.5 rounded-xl transition-all-300 focus:outline-none"
            aria-label="Close Ad"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Ad Body Content */}
        <div className="relative p-2">
          {ad.link ? (
            <a
              href={ad.link}
              target="_blank"
              rel="noreferrer"
              onClick={handleClose}
              className="block group overflow-hidden rounded-2xl relative"
            >
              <img
                src={`http://localhost:8000${ad.image}`}
                alt={ad.title}
                className="w-full h-auto max-h-[400px] object-cover group-hover:scale-102 transition-all duration-500"
              />
              {/* Overlay hover effect */}
              <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white/90 backdrop-blur-sm text-slate-800 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                  <span>Visit Promotion Link</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          ) : (
            <div className="overflow-hidden rounded-2xl">
              <img
                src={`http://localhost:8000${ad.image}`}
                alt={ad.title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="px-5 py-3 bg-slate-50 text-center text-[10px] font-bold text-slate-400 border-t border-slate-100">
          Click promotion photo to view details. Close to proceed.
        </div>
      </div>
    </div>
  );
};

export default AdPopup;
