import React, { useState } from 'react';
import {
  Droplets,
  Sun,
  Thermometer,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Info,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { PlantInfo, WeatherData } from '../types/plant';
import { getSmartWateringAdvice } from '../utils/smartWateringTips';
import { speakText, stopSpeech } from '../utils/speech';

interface SmartWateringTipsSectionProps {
  plantData: PlantInfo;
  weather: WeatherData | null;
  language: 'gu' | 'en';
}

export const SmartWateringTipsSection: React.FC<SmartWateringTipsSectionProps> = ({
  plantData,
  weather,
  language,
}) => {
  const isGu = language === 'gu';

  // Live defaults
  const liveTemp = weather ? Math.round(weather.temperature) : 32;
  const liveHumidity = weather ? Math.round(weather.humidity) : 72;

  // Simulator state (allows user to test various conditions or stay on live weather)
  const [selectedPreset, setSelectedPreset] = useState<'live' | 'hot' | 'humid' | 'cool' | 'custom'>('live');
  const [customTemp, setCustomTemp] = useState<number>(liveTemp);
  const [customHumidity, setCustomHumidity] = useState<number>(liveHumidity);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active temperature & humidity being evaluated
  let activeTemp = liveTemp;
  let activeHumidity = liveHumidity;

  if (selectedPreset === 'hot') {
    activeTemp = 37;
    activeHumidity = 38;
  } else if (selectedPreset === 'humid') {
    activeTemp = 28;
    activeHumidity = 82;
  } else if (selectedPreset === 'cool') {
    activeTemp = 16;
    activeHumidity = 52;
  } else if (selectedPreset === 'custom') {
    activeTemp = customTemp;
    activeHumidity = customHumidity;
  }

  const advice = getSmartWateringAdvice(plantData, weather, activeTemp, activeHumidity);

  const handleAudioPlayback = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const textToRead = isGu
      ? `સ્માર્ટ વોટરિંગ સલાહ. ${advice.headline.gu}. તાપમાન સલાહ: ${advice.temperatureAdvice.gu}. ભેજ સલાહ: ${advice.humidityAdvice.gu}. શ્રેષ્ઠ સમય: ${advice.bestTimeToWater.gu}. ${advice.soilMoistureTip.gu}`
      : `Smart Watering Advice. ${advice.headline.en}. Temperature advice: ${advice.temperatureAdvice.en}. Humidity advice: ${advice.humidityAdvice.en}. Best time to water: ${advice.bestTimeToWater.en}. ${advice.soilMoistureTip.en}`;

    setIsSpeaking(true);
    speakText(textToRead, language).finally(() => {
      setIsSpeaking(false);
    });
  };

  const isHotCondition = activeTemp >= 30;
  const isHumidCondition = activeHumidity >= 68;

  return (
    <div className="bg-slate-900 border border-cyan-900/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -left-20 -top-20 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>{isGu ? 'સ્માર્ટ વોટરિંગ ટિપ્સ' : 'Smart Watering Tips'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                {isGu ? 'વાતાવરણ આધારિત સલાહ' : 'Real-Time Climate Driven'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isGu
                ? 'હાલના તાપમાન અને હવામાં ભેજના આધારે છોડને પાણી આપવાનું સચોટ માર્ગદર્શન'
                : 'Specific watering and shade advice tailored to current temperature and humidity'}
            </p>
          </div>
        </div>

        {/* Audio narration & active climate pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAudioPlayback}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              isSpeaking
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border-slate-700'
            }`}
            title={isGu ? 'વાંચી સંભળાવો' : 'Read aloud'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isSpeaking ? (isGu ? 'બંધ કરો' : 'Stop') : (isGu ? 'સાંભળો' : 'Listen')}
            </span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-750 flex items-center gap-2 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Thermometer className="w-3.5 h-3.5" />
              {activeTemp}°C
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Droplets className="w-3.5 h-3.5" />
              {activeHumidity}%
            </span>
            {weather?.city && selectedPreset === 'live' && (
              <>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-400 hidden sm:inline truncate max-w-[100px]">{weather.city}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Presets & Live Weather Toggle */}
      <div className="mb-6 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            {isGu ? 'વાતાવરણ સ્થિતિ પસંદ કરો અથવા લાઈવ રાખો:' : 'Select Weather Condition or Test Scenarios:'}
          </span>
          {selectedPreset !== 'live' && (
            <button
              onClick={() => {
                setSelectedPreset('live');
                setCustomTemp(liveTemp);
                setCustomHumidity(liveHumidity);
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              {isGu ? 'લાઈવ વાતાવરણ પર પાછા જાઓ' : 'Reset to Live Weather'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPreset('live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPreset === 'live'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{isGu ? `તમારું લાઈવ વાતાવરણ (${liveTemp}°C / ${liveHumidity}%)` : `Live Local Weather (${liveTemp}°C / ${liveHumidity}%)`}</span>
          </button>

          <button
            onClick={() => setSelectedPreset('hot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPreset === 'hot'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>{isGu ? 'ખૂબ ગરમી (37°C / 38%)' : 'Hot Summer Day (37°C / 38%)'}</span>
          </button>

          <button
            onClick={() => setSelectedPreset('humid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPreset === 'humid'
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750'
            }`}
          >
            <Droplets className="w-3 h-3 text-teal-400" />
            <span>{isGu ? 'ભારે ભેજ / ચોમાસું (28°C / 82%)' : 'High Humidity (28°C / 82%)'}</span>
          </button>

          <button
            onClick={() => setSelectedPreset('cool')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPreset === 'cool'
                ? 'bg-indigo-500 text-white shadow-md font-bold'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750'
            }`}
          >
            <Thermometer className="w-3 h-3 text-indigo-400" />
            <span>{isGu ? 'ઠંડક / શિયાળો (16°C / 52%)' : 'Cool Weather (16°C / 52%)'}</span>
          </button>

          <button
            onClick={() => setSelectedPreset('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedPreset === 'custom'
                ? 'bg-slate-700 text-white border border-slate-500'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-750'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>{isGu ? 'કસ્ટમ સ્લાઇડર' : 'Custom Slider'}</span>
          </button>
        </div>

        {/* Custom Slider Drawer */}
        {selectedPreset === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{isGu ? 'તાપમાન (Temperature):' : 'Temperature:'}</span>
                <span className="font-bold text-amber-400">{customTemp}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={customTemp}
                onChange={(e) => setCustomTemp(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{isGu ? 'હવામાં ભેજ (Humidity):' : 'Humidity:'}</span>
                <span className="font-bold text-cyan-400">{customHumidity}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="95"
                value={customHumidity}
                onChange={(e) => setCustomHumidity(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 🌟 HIGHLIGHTED SMART ADVICE BANNER (Specific Prompted Advice) 🌟 */}
      {/* ==================================================================== */}
      <div
        className={`mb-6 p-5 rounded-2xl border transition-all ${
          isHotCondition && isHumidCondition
            ? 'bg-gradient-to-r from-amber-950/40 via-cyan-950/30 to-slate-850 border-amber-600/40'
            : isHotCondition
            ? 'bg-gradient-to-r from-amber-950/50 via-slate-850 to-slate-850 border-amber-500/40'
            : isHumidCondition
            ? 'bg-gradient-to-r from-teal-950/50 via-slate-850 to-slate-850 border-teal-500/40'
            : 'bg-gradient-to-r from-cyan-950/40 via-slate-850 to-slate-850 border-cyan-800/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
              isHotCondition
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : isHumidCondition
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isHotCondition ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : isHumidCondition ? (
              <Droplets className="w-5 h-5 text-cyan-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isGu ? 'આજની મુખ્ય સ્માર્ટ વોટરિંગ ભલામણ:' : "Today's Primary Watering Advice:"}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  advice.frequencyModifier.type === 'increase'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : advice.frequencyModifier.type === 'decrease'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isGu ? advice.frequencyModifier.gu : advice.frequencyModifier.en}
              </span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              {isGu ? advice.headline.gu : advice.headline.en}
            </p>

            {/* Explicit quote callouts for key triggers */}
            {isHotCondition && (
              <div className="text-xs font-medium text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40 mt-2 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {isGu
                    ? `⚠️ આજે ખૂબ જ ગરમી છે, છોડને બપોરના આકરા તડકાથી બચાવી છાંયડાવાળા વિસ્તારમાં રાખો (Ensure your plant stays in shaded area).`
                    : `⚠️ It is very hot today, ensure your plant stays in shaded area.`}
                </span>
              </div>
            )}

            {isHumidCondition && (
              <div className="text-xs font-medium text-cyan-300 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/40 mt-2 flex items-start gap-2">
                <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  {isGu
                    ? `💧 હવામાં વધુ ભેજ છે, પાણી આપવાની આવર્તન ઓછી કરો (High humidity detected, reduce watering frequency).`
                    : `💧 High humidity detected, reduce watering frequency.`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Temperature vs Humidity Dual Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Temperature Card */}
        <div className="bg-slate-850/80 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Thermometer className="w-4 h-4" />
              <span>{isGu ? 'તાપમાન અસર અને માવજત' : 'Temperature Impact & Care'}</span>
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {activeTemp}°C
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {isGu ? advice.temperatureAdvice.gu : advice.temperatureAdvice.en}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isGu ? 'છોડની આદર્શ મર્યાદા:' : 'Ideal Plant Range:'}</span>
            <span className="text-slate-300 font-semibold">
              {plantData.environmentalNeeds?.minTemp ?? 18}°C - {plantData.environmentalNeeds?.maxTemp ?? 35}°C
            </span>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-slate-850/80 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Droplets className="w-4 h-4" />
              <span>{isGu ? 'હવામાં ભેજ અસર અને માવજત' : 'Humidity Impact & Care'}</span>
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {activeHumidity}%
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {isGu ? advice.humidityAdvice.gu : advice.humidityAdvice.en}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{isGu ? 'છોડની આદર્શ ભેજ શ્રેણી:' : 'Ideal Humidity Range:'}</span>
            <span className="text-slate-300 font-semibold">
              {plantData.environmentalNeeds?.idealHumidityMin ?? 40}% - {plantData.environmentalNeeds?.idealHumidityMax ?? 70}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 Actionable Practical Tip Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {advice.actionableTips.map((tip, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              tip.highlight
                ? 'bg-slate-850 border-cyan-700/50 shadow-md'
                : 'bg-slate-850/60 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-white">
                {tip.icon === 'sun' && <Sun className="w-4 h-4 text-amber-400 shrink-0" />}
                {tip.icon === 'droplet' && <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />}
                {tip.icon === 'clock' && <Clock className="w-4 h-4 text-emerald-400 shrink-0" />}
                {tip.icon === 'shield' && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
                <span>{isGu ? tip.title.gu : tip.title.en}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isGu ? tip.desc.gu : tip.desc.en}
              </p>
            </div>
            {tip.highlight && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                ⭐ {isGu ? 'આજની પ્રાથમિકતા' : "Today's Focus"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {isGu
              ? `આ છોડનું મૂળભૂત સમયપત્રક: ${plantData.careGuide?.watering?.frequency || 'નિયમિત'}`
              : `Baseline species schedule: ${plantData.careGuide?.watering?.frequency || 'Regular'}`}
          </span>
        </span>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          {plantData.plantName.scientificName}
        </span>
      </div>
    </div>
  );
};
