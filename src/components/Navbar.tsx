import React from 'react';
import { Sprout, CloudSun, Flower2, Stethoscope, Languages, MapPin, Sparkles, Droplets, FlaskConical } from 'lucide-react';
import { WeatherData } from '../types/plant';

interface NavbarProps {
  activeTab: 'scanner' | 'climate' | 'garden' | 'doctor';
  setActiveTab: (tab: 'scanner' | 'climate' | 'garden' | 'doctor') => void;
  language: 'gu' | 'en';
  setLanguage: (lang: 'gu' | 'en') => void;
  weather: WeatherData | null;
  gardenCount: number;
  dueWaterCount?: number;
  dueFertilizerCount?: number;
  onOpenWeatherModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  weather,
  gardenCount,
  dueWaterCount = 0,
  dueFertilizerCount = 0,
  onOpenWeatherModal,
}) => {
  const isGu = language === 'gu';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/30 text-white">
      {/* 🏫 Bhikhapura Primary School Top Affiliation Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/40 py-1.5 px-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-emerald-300 tracking-wide truncate">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs shrink-0">
              🏫
            </span>
            <span className="text-emerald-200 font-bold truncate">
              {isGu
                ? 'ભીખાપુરા પ્રાથમિક શાળા, તા. હાલોલ, જિ. પંચમહાલ'
                : 'Bhikhapura Prathamik Shala, Ta. Halol, Dist. Panchmahal'}
            </span>
            <span className="hidden sm:inline text-emerald-500/50">•</span>
            <span className="hidden sm:inline text-[11px] text-emerald-400/80 font-normal">
              {isGu ? 'વનસ્પતિ અને પર્યાવરણ વિજ્ઞાન પ્રોજેક્ટ' : 'Botanical & Eco Science Lab'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 shrink-0 hidden md:flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/30">
              {isGu ? 'હાલોલ, પંચમહાલ' : 'Halol, Panchmahal'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('scanner')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 bg-clip-text text-transparent">
                  {isGu ? 'પ્લાન્ટ સ્કેનર AI' : 'PlantScanner AI'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isGu ? 'વાતાવરણ' : 'Climate'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/90 font-medium -mt-0.5 flex items-center gap-1">
                <span>🏫</span>
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {isGu
                    ? 'ભીખાપુરા પ્રાથમિક શાળા, તા. હાલોલ, જિ. પંચમહાલ'
                    : 'Bhikhapura Prathamik Shala, Ta. Halol, Dist. Panchmahal'}
                </span>
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sprout className="w-4 h-4" />
              {isGu ? 'છોડ સ્કેનર' : 'Scan Plant'}
            </button>

            <button
              onClick={() => setActiveTab('climate')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'climate'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CloudSun className="w-4 h-4" />
              {isGu ? 'વાતાવરણ માર્ગદર્શિકા' : 'Climate Guide'}
            </button>

            <button
              onClick={() => setActiveTab('garden')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'garden'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Flower2 className="w-4 h-4" />
              <span>{isGu ? 'મારું ગાર્ડન' : 'My Garden'}</span>
              <div className="flex items-center gap-1">
                {dueWaterCount > 0 && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-sm animate-pulse"
                    title={isGu ? `${dueWaterCount} છોડને પાણીની જરૂર છે` : `${dueWaterCount} plants need water`}
                  >
                    <Droplets className="w-3 h-3 fill-slate-950" />
                    <span>{dueWaterCount}</span>
                  </span>
                )}
                {dueFertilizerCount > 0 && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-sm animate-pulse"
                    title={isGu ? `${dueFertilizerCount} છોડને ખાતરની જરૂર છે` : `${dueFertilizerCount} plants need fertilizer`}
                  >
                    <FlaskConical className="w-3 h-3" />
                    <span>{dueFertilizerCount}</span>
                  </span>
                )}
                {dueWaterCount === 0 && dueFertilizerCount === 0 && gardenCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                    {gardenCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('doctor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'doctor'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              {isGu ? 'પ્લાન્ટ ડૉક્ટર' : 'Plant Doctor'}
            </button>
          </nav>

          {/* Right Controls: Weather Widget Button & Language Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Realtime Weather Pill */}
            {weather ? (
              <button
                onClick={onOpenWeatherModal}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs transition-colors hover:border-emerald-500/50"
                title={isGu ? 'વાતાવરણ બદલો / વિગતો જુઓ' : 'Change Location / View Weather'}
              >
                <div className="flex items-center gap-1 text-emerald-400 font-medium truncate max-w-[110px] sm:max-w-[140px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">{weather.city.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-white bg-slate-700/60 px-1.5 py-0.5 rounded">
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{weather.temperature}°C</span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenWeatherModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 border border-slate-700"
              >
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                <span>{isGu ? 'હવામાન લોડ થાય છે' : 'Weather'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(isGu ? 'en' : 'gu')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-xs font-semibold transition-all hover:scale-102"
              title={isGu ? 'Switch to English' : 'ગુજરાતીમાં જુઓ'}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isGu ? 'English' : 'ગુજરાતી'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Bottom or sub-bar) */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'scanner' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{isGu ? 'સ્કેન' : 'Scan'}</span>
          </button>
          <button
            onClick={() => setActiveTab('climate')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'climate' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>{isGu ? 'વાતાવરણ' : 'Climate'}</span>
          </button>
          <button
            onClick={() => setActiveTab('garden')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg relative ${
              activeTab === 'garden' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Flower2 className="w-4 h-4" />
            <span>{isGu ? 'ગાર્ડન' : 'Garden'}</span>
            {dueWaterCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] animate-pulse">
                {dueWaterCount}
              </span>
            ) : dueFertilizerCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] animate-pulse">
                {dueFertilizerCount}
              </span>
            ) : gardenCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {gardenCount}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'doctor' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{isGu ? 'ડૉક્ટર' : 'Doctor'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
