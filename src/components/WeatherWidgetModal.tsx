import React, { useState } from 'react';
import { X, MapPin, Navigation, Droplets, Wind, Thermometer, Sun, Check, AlertCircle } from 'lucide-react';
import { WeatherData } from '../types/plant';

interface WeatherWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData | null;
  onSelectCity: (city: string) => void;
  onDetectLocation: () => void;
  isLoading: boolean;
  language: 'gu' | 'en';
  errorMessage?: string | null;
}

const POPULAR_CITIES = [
  { gu: 'હાલોલ - પંચમહાલ (Halol)', en: 'Halol' },
  { gu: 'વડોદરા (Vadodara)', en: 'Vadodara' },
  { gu: 'અમદાવાદ (Ahmedabad)', en: 'Ahmedabad' },
  { gu: 'સુરત (Surat)', en: 'Surat' },
  { gu: 'રાજકોટ (Rajkot)', en: 'Rajkot' },
  { gu: 'ભાવનગર (Bhavnagar)', en: 'Bhavnagar' },
  { gu: 'જૂનાગઢ (Junagadh)', en: 'Junagadh' },
  { gu: 'જામનગર (Jamnagar)', en: 'Jamnagar' },
  { gu: 'ભુજ - કચ્છ (Bhuj)', en: 'Bhuj' },
  { gu: 'મુંબઈ (Mumbai)', en: 'Mumbai' },
  { gu: 'દિલ્હી (Delhi)', en: 'Delhi' },
  { gu: 'બેંગલુરુ (Bengaluru)', en: 'Bengaluru' },
];

export const WeatherWidgetModal: React.FC<WeatherWidgetModalProps> = ({
  isOpen,
  onClose,
  weather,
  onSelectCity,
  onDetectLocation,
  isLoading,
  language,
  errorMessage,
}) => {
  const [customCity, setCustomCity] = useState('');
  const isGu = language === 'gu';

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim()) {
      onSelectCity(customCity.trim());
      setCustomCity('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-emerald-950/40 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isGu ? 'હવામાન અને વાતાવરણ સેટિંગ્સ' : 'Weather & Climate Settings'}
              </h3>
              <p className="text-xs text-slate-400">
                {isGu ? 'તમારા વિસ્તારનું વાતાવરણ પસંદ કરો' : 'Select your local environmental context'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Current Live Weather Card */}
          {weather && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-850 to-slate-800 border border-emerald-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{weather.city}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isGu ? 'સક્રિય વાતાવરણ' : 'Active Weather'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-1">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{isGu ? 'તાપમાન' : 'Temp'}</span>
                  </div>
                  <div className="text-xl font-bold text-white">{weather.temperature}°C</div>
                  <div className="text-[10px] text-slate-400">{Math.round((weather.temperature * 9/5) + 32)}°F</div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{isGu ? 'હવામાં ભેજ' : 'Humidity'}</span>
                  </div>
                  <div className="text-xl font-bold text-white">{weather.humidity}%</div>
                  <div className="text-[10px] text-slate-400">
                    {weather.humidity > 60 ? (isGu ? 'ભારે ભેજ' : 'High') : (isGu ? 'સામાન્ય' : 'Normal')}
                  </div>
                </div>

                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-center gap-1 text-teal-400 text-xs mb-1">
                    <Wind className="w-3.5 h-3.5" />
                    <span>{isGu ? 'પવન' : 'Wind'}</span>
                  </div>
                  <div className="text-xl font-bold text-white">{weather.windSpeed}</div>
                  <div className="text-[10px] text-slate-400">km/h</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="text-slate-400">{isGu ? 'હાલની સ્થિતિ:' : 'Condition:'}</span>
                <span className="font-medium text-emerald-300">{weather.conditionText}</span>
              </div>
            </div>
          )}

          {/* Detect Location Button */}
          <div>
            <button
              onClick={onDetectLocation}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-sm font-medium transition-all hover:border-emerald-500/50"
            >
              <Navigation className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isGu ? 'મારું લાઈવ લોકેશન (GPS) મેળવો' : 'Detect My Exact GPS Location'}</span>
            </button>
            {errorMessage && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Popular Cities */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {isGu ? 'ગુજરાત અને ભારતના મુખ્ય શહેરો' : 'Popular Cities'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_CITIES.map((c) => {
                const isSelected = weather?.city.toLowerCase().includes(c.en.toLowerCase());
                return (
                  <button
                    key={c.en}
                    onClick={() => onSelectCity(c.en)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-750 hover:border-slate-600'
                    }`}
                  >
                    <span className="truncate">{isGu ? c.gu.split(' ')[0] : c.en}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom City Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isGu ? 'કોઈપણ શહેર અથવા ગામ શોધો' : 'Search Any City or Town'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder={isGu ? 'દા.ત. સુરત, આણંદ, ગોંડલ...' : 'e.g. Surat, Anand, Gondal...'}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!customCity.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {isGu ? 'લાગુ કરો' : 'Apply'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold"
          >
            {isGu ? 'બંધ કરો' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
