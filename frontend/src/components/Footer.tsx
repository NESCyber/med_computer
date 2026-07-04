import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm flex flex-col items-center gap-4">
        {/* Contact and direction details on top */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="uppercase">{settings.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-primary" />
            <span>TEL: {settings.phone_1} / {settings.phone_2}</span>
          </span>
        </div>
        
        {/* Copyright notice below */}
        <div className="border-t border-slate-100 w-full pt-4 max-w-md">
          <p className="font-semibold text-slate-500 text-xs">© {new Date().getFullYear()} {settings.store_name.toUpperCase()} &amp; TECH HUB. All rights reserved.</p>
          <p className="mt-1 text-slate-400 text-[10px] font-medium">High-Performance Hardware Configurations &amp; Procurement Desk.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
