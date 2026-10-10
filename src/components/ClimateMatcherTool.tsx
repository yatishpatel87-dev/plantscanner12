import React, { useState } from 'react';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sprout,
  Compass,
} from 'lucide-react';
import { WeatherData } from '../types/plant';
import { SAMPLE_PLANTS, SamplePlant } from '../data/samplePlants';

interface ClimateMatcherToolProps {
  weather: WeatherData | null;
  language: 'gu' | 'en';
  onSelectPlantToScan: (sample: SamplePlant) => void;
  onOpenWeatherModal: () => void;
}

export const ClimateMatcherTool: React.FC<ClimateMatcherToolProps> = ({
  weather,
  language,
  onSelectPlantToScan,
  onOpenWeatherModal,
}) => {
  const isGu = language === 'gu';

  // Environmental sliders
  const [selectedSeason, setSelectedSeason] = useState<'summer' | 'monsoon' | 'winter'>('summer');
  const [testTemp, setTestTemp] = useState<number>(weather?.temperature ?? 30);
  const [testHumidity, setTestHumidity] = useState<number>(weather?.humidity ?? 55);

  const climateZonesInfo = [
    {
      titleGu: 'ઉનાળો (ગરમ અને સૂકું વાતાવરણ)',
      titleEn: 'Summer (Hot & Dry Climate)',
      tempRange: '32°C - 45°C',
      plantsGu: 'કુંવારપાઠું (Aloe Vera), લીમડો, બોગનવેલિયા, ચંપો, બારમાસી',
      plantsEn: 'Aloe Vera, Neem, Bougainvillea, Plumeria, Periwinkle',
      tipsGu: 'બપોરના તીવ્ર તડકાથી બચાવવા ગ્રીન નેટ વાપરો, સવારે અથવા સાંજે જ પાણી આપો.',
      tipsEn: 'Use green shade netting, water early morning or post-sunset.',
    },
    {
      titleGu: 'ચોમાસું (ભારે ભેજ અને વરસાદ)',
      titleEn: 'Monsoon (High Humidity & Rain)',
      tempRange: '25°C - 32°C | ભેજ > 75%',
      plantsGu: 'તુલસી, મની પ્લાન્ટ, ફર્ન, મની ટ્રી, સોપારી પામ',
      plantsEn: 'Holy Basil, Money Plant, Ferns, Areca Palm',
      tipsGu: 'કૂંડામાં પાણી જમા ન થવા દો (સારી નિતાર વ્યવસ્થા), ફૂગથી બચવા ખાટી છાશ કે લીમડાનું તેલ છાંટો.',
      tipsEn: 'Ensure excellent drainage to prevent root rot; apply neem oil to deter fungal pests.',
    },
    {
      titleGu: 'શિયાળો (ઠંડું અને ખુશનુમા વાતાવરણ)',
      titleEn: 'Winter (Mild to Cool Climate)',
      tempRange: '12°C - 26°C',
      plantsGu: 'ગુલાબ, ડાલિયા, મેરીગોલ્ડ (ગલગોટો), પેટુનિયા, ટામેટાં',
      plantsEn: 'Rose, Dahlia, Marigold, Petunia, Tomatoes',
      tipsGu: 'સૂર્યપ્રકાશ ભરપૂર આપો, ઝાકળ અને અતિશય ઠંડી રાત્રે કુંડા અંદર લઈ લો, પાણીનું પ્રમાણ ઘટાડો.',
      tipsEn: 'Maximize full sunlight, reduce watering frequency, shield delicate buds from heavy frost.',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900/50 via-slate-900 to-slate-950 border border-emerald-800/40 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
              <CloudSun className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isGu ? 'વાતાવરણ અને હવામાન માર્ગદર્શિકા' : 'Climate & Weather Intelligence'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {isGu ? 'તમારા શહેરનું વાતાવરણ છોડ માટે કેવું છે?' : 'How Does Your Local Climate Suit Plants?'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              {isGu
                ? 'તાપમાન, ભેજ અને ઋતુ અનુસાર છોડની પસંદગી કરો જેથી તમારો બગીચો હંમેશા હર્યોભર્યો રહે.'
                : 'Match plant species with your real-time temperature, humidity, and seasonal changes.'}
            </p>
          </div>

          {/* Quick weather badge */}
          {weather && (
            <button
              onClick={onOpenWeatherModal}
              className="p-4 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-left transition-all hover:border-emerald-500/40"
            >
              <div className="text-[11px] text-slate-400">{isGu ? 'હાલનું લાઈવ હવામાન' : 'Live Local Climate'}</div>
              <div className="text-base font-bold text-white mt-0.5">{weather.city}</div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="font-bold text-emerald-400">{weather.temperature}°C</span>
                <span className="text-slate-500">|</span>
                <span className="font-bold text-cyan-400">{weather.humidity}% {isGu ? 'ભેજ' : 'humidity'}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Climate Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>{isGu ? 'વાતાવરણ સિમ્યુલેટર (Climate Simulator)' : 'Climate Simulator'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isGu
              ? 'નીચે સ્લાઇડર ફેરવીને તાપમાન અને ભેજ બદલો અને જુઓ કે કયા છોડ શ્રેષ્ઠ રહેશે:'
              : 'Adjust temperature and humidity below to see ideal plant suitability:'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-850 p-6 rounded-2xl border border-slate-800">
          {/* Temperature Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4" />
                {isGu ? 'તાપમાન (Temperature)' : 'Temperature'}
              </span>
              <span className="text-xl font-bold text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                {testTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={testTemp}
              onChange={(e) => setTestTemp(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>5°C (ખૂબ ઠંડુ)</span>
              <span>25°C (સામાન્ય)</span>
              <span>50°C (અતિ ગરમ)</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-cyan-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                {isGu ? 'હવામાં ભેજ (Humidity)' : 'Relative Humidity'}
              </span>
              <span className="text-xl font-bold text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                {testHumidity}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={testHumidity}
              onChange={(e) => setTestHumidity(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>10% (સૂકું વાતાવરણ)</span>
              <span>50% (મધ્યમ)</span>
              <span>100% (ભારે વરસાદી)</span>
            </div>
          </div>
        </div>

        {/* Live Recommendation Result */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-850 to-slate-850 border border-emerald-800/40">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              {testTemp > 35
                ? (isGu ? 'ગરમ અને શુષ્ક વાતાવરણ વિશ્લેષણ' : 'Hot & Arid Environment Analysis')
                : testTemp < 18
                ? (isGu ? 'ઠંડુ વાતાવરણ વિશ્લેષણ' : 'Cool Environment Analysis')
                : (isGu ? 'અનુકૂળ સમશીતોષ્ણ વાતાવરણ' : 'Optimal Temperate Climate')}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
            {testTemp > 35
              ? (isGu
                ? `આટલા ઊંચા તાપમાને (${testTemp}°C) કુંવારપાઠું, લીમડો, કેક્ટસ અને બોગનવેલિયા જેવા છોડ ખૂબ સારી રીતે જીવી શકે છે. તુલસી અને ગુલાબને બપોરના સમયે છાંયડામાં રાખવા જરૂરી છે.`
                : `At ${testTemp}°C, succulents, desert plants, Neem, and Bougainvillea thrive. Holy Basil and Roses need afternoon shade.`)
              : testTemp < 18
              ? (isGu
                ? `આ તાપમાને (${testTemp}°C) ગુલાબ, ગલગોટો (મેરીગોલ્ડ), પેટુનિયા અને શિયાળુ શાકભાજી ખૂબ સુંદર ઉગે છે.`
                : `At ${testTemp}°C, Roses, Marigolds, Petunias, and winter greens thrive delightfully.`)
              : (isGu
                ? `આ ખુશનુમા વાતાવરણ (${testTemp}°C અને ${testHumidity}% ભેજ) તુલસી, મની પ્લાન્ટ, સ્નેક પ્લાન્ટ અને લગભગ તમામ ઘરગથ્થુ છોડ માટે આદર્શ છે.`
                : `This pleasant climate (${testTemp}°C, ${testHumidity}% humidity) is ideal for Tulsi, Money Plant, Snake Plant, and most home greenery.`)}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400">{isGu ? 'આ વાતાવરણ માટે અનુકૂળ છોડ સ્કેન કરો:' : 'Scan sample plants matching this:'}</span>
            {SAMPLE_PLANTS.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPlantToScan(p)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-slate-700 text-xs font-medium transition-all"
              >
                {isGu ? p.nameGu.split('(')[0] : p.nameEn.split('(')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Seasons In-Depth Guide */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <span>{isGu ? 'ગુજરાત અને ભારતીય ઋતુઓ અનુસાર વાતાવરણ માર્ગદર્શન' : 'Seasonal Climate Guidelines'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {climateZonesInfo.map((zone, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span>{zone.tempRange}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {isGu ? zone.titleGu : zone.titleEn}
                </h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    <strong className="text-emerald-300">{isGu ? 'શ્રેષ્ઠ છોડ:' : 'Best Plants:'} </strong>
                    {isGu ? zone.plantsGu : zone.plantsEn}
                  </p>
                  <p>
                    <strong className="text-amber-300">{isGu ? 'વાતાવરણ સલાહ:' : 'Care Advice:'} </strong>
                    {isGu ? zone.tipsGu : zone.tipsEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
