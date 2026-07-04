import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export interface SiteSettings {
  store_name: string;
  location: string;
  phone_1: string;
  phone_2: string;
  whatsapp_number: string;
  momo_number: string;
  momo_name: string;
}

const defaultSettings: SiteSettings = {
  store_name: "MED Computers",
  location: "DIRECTLY OPPOSITE TO AIRTEL TIGO OFFICE, TAMALE.",
  phone_1: "0549128355",
  phone_2: "0508800955",
  whatsapp_number: "233549128355",
  momo_number: "0549128355",
  momo_name: "MED COMPUTERS",
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/settings/`)
      .then((res: Response) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: SiteSettings) => {
        if (data) {
          setSettings(data);
        }
      })
      .catch((err: Error) => {
        console.error('Failed to fetch site settings, using defaults.', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
