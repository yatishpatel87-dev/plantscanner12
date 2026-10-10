import React, { useState } from 'react';
import {
  PlantInfo,
  WeatherData,
} from '../types/plant';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Volume2,
  VolumeX,
  Stethoscope,
  Sparkles,
  Calendar,
  AlertTriangle,
  Info,
  BookmarkPlus,
  Check,
  Layers,
  FlaskConical,
  Scissors,
  Share2,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';
import { SmartWateringTipsSection } from './SmartWateringTipsSection';

interface PlantDetailsViewProps {
  plantData: PlantInfo;
  imageUrl: string;
  weather: WeatherData | null;
  language: 'gu' | 'en';
  onSaveToGarden: (plant: PlantInfo, image: string) => void;
  isSaved: boolean;
  onAskDoctor: (plantName: string) => void;
  onScanAnother: () => void;
  onOpenGrowthTracker?: () => void;
}

export const PlantDetailsView: React.FC<PlantDetailsViewProps> = ({
  plantData,
  imageUrl,
  weather,
  language,
  onSaveToGarden,
  isSaved,
  onAskDoctor,
  onScanAnother,
  onOpenGrowthTracker,
}) => {
  const isGu = language === 'gu';
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);

  const {
    plantName,
    confidenceScore,
    shortOverview,
    environmentalNeeds,
    careGuide,
    healthStatus,
    benefitsAndUses,
    funFacts,
    audioScript,
    isPlant,
    nonPlantMessage,
  } = plantData;

  // Handle Text to Speech playback
  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = isGu
        ? audioScript?.gujarati || shortOverview.gujarati
        : audioScript?.english || shortOverview.english;

      await speakText(textToSpeak, isGu ? 'gu' : 'en');
      setIsPlayingAudio(false);
    }
  };

  const handleSave = () => {
    onSaveToGarden(plantData, imageUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // If AI determined this is not a plant
  if (!isPlant) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {isGu ? 'કોઈ છોડ ઓળખાયો નથી' : 'No Plant Detected'}
          </h3>
          <p className="text-slate-300 text-sm">
            {nonPlantMessage ||
              (isGu
                ? 'આ ફોટામાં કોઈ વનસ્પતિ કે છોડ સ્પષ્ટ દેખાતો નથી. કૃપા કરીને છોડ અથવા તેના પાંદડાનો સ્પષ્ટ ફોટો પાડો.'
                : 'The uploaded image does not appear to contain a recognizable plant. Please try capturing a clearer picture of leaves or stem.')}
          </p>
        </div>
        <button
          onClick={onScanAnother}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
        >
          {isGu ? 'ફરીથી નવો ફોટો સ્કેન કરો' : 'Try Another Photo'}
        </button>
      </div>
    );
  }

  // Calculate environmental suitability indicator
  const compScore = environmentalNeeds.weatherCompatibilityScore ?? 85;
  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return {
        text: isGu ? 'ઉત્તમ આબોહવા અનુકૂળતા' : 'Excellent Climate Match',
        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        ring: 'text-emerald-400',
      };
    } else if (score >= 60) {
      return {
        text: isGu ? 'સામાન્ય વાતાવરણ અનુકૂળતા' : 'Moderate Match',
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        ring: 'text-amber-400',
      };
    } else {
      return {
        text: isGu ? 'વિશેષ રક્ષણ / કાળજી જરૂરી' : 'Needs Climate Protection',
        bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        ring: 'text-rose-400',
      };
    }
  };

  const scoreBadge = getScoreBadge(compScore);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <button
          onClick={onScanAnother}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isGu ? 'બીજો છોડ સ્કેન કરો' : 'Scan Another Plant'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Audio Reader */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isPlayingAudio
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
            title={isGu ? 'ઓડિયોમાં માહિતી સાંભળો' : 'Listen to plant summary'}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span>{isGu ? 'અવાજ બંધ કરો' : 'Stop Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>{isGu ? 'ઓડિયો સાંભળો' : 'Listen Audio'}</span>
              </>
            )}
          </button>

          {/* Ask Plant Doctor */}
          <button
            onClick={() => onAskDoctor(plantName.gujaratiName || plantName.commonEnglish)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-900/40 hover:bg-teal-900/60 text-teal-300 border border-teal-700/50 text-xs font-semibold transition-all"
          >
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>{isGu ? 'ડૉક્ટરને પૂછો' : 'Ask Doctor'}</span>
          </button>

          {/* Growth Tracker & Chart */}
          {onOpenGrowthTracker && (
            <button
              onClick={onOpenGrowthTracker}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-semibold transition-all"
              title={isGu ? 'છોડનો વિકાસ ચાર્ટ અને ઊંચાઈ-પાંદડા લોગ જુઓ' : 'View growth chart and height/leaf logs'}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{isGu ? 'વૃદ્ધિ ચાર્ટ' : 'Growth Chart'}</span>
            </button>
          )}

          {/* Save to Garden */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>{isGu ? 'સાચવ્યું!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                <span>{isGu ? 'ગાર્ડનમાં ઉમેરો' : 'Add to Garden'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Plant Photo */}
          <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
            <img
              src={imageUrl}
              alt={plantName.commonEnglish}
              className="w-full h-full object-cover max-h-[420px] lg:max-h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent lg:hidden" />

            {/* Confidence tag on image */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{confidenceScore}% {isGu ? 'વિશ્વાસપાત્ર ઓળખ' : 'Confidence'}</span>
              </span>
            </div>

            {/* Health condition tag */}
            <div className="absolute bottom-4 left-4 lg:bottom-4 lg:left-4">
              {healthStatus.status === 'healthy' ? (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-600/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isGu ? 'તંદુરસ્ત છોડ' : 'Healthy Plant'}</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-950/90 backdrop-blur-md text-amber-300 border border-amber-600/40 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>{isGu ? 'રોગ / કાળજી જરૂરી' : 'Care Needed'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Plant Core Information */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Botanical Family & Scientific Name */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {plantName.family}
                </span>
                <span className="text-xs italic text-emerald-400/90 font-medium">
                  {plantName.scientificName}
                </span>
              </div>

              {/* Main Titles */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {plantName.gujaratiName}
              </h1>
              <p className="text-lg text-slate-300 font-medium mt-1">
                {plantName.commonEnglish} {plantName.hindiName ? `(${plantName.hindiName})` : ''}
              </p>

              {/* Short Overview */}
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                {isGu ? shortOverview.gujarati : shortOverview.english}
              </p>
            </div>

            {/* Key Quick Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800">
              <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>{isGu ? 'સૂર્યપ્રકાશ' : 'Sunlight'}</span>
                </div>
                <div className="text-xs font-semibold text-white mt-1 truncate">
                  {environmentalNeeds.sunlightHours}
                </div>
              </div>

              <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-400" />
                  <span>{isGu ? 'તાપમાન' : 'Temp'}</span>
                </div>
                <div className="text-xs font-semibold text-white mt-1 truncate">
                  {environmentalNeeds.minTemp}°C - {environmentalNeeds.maxTemp}°C
                </div>
              </div>

              <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{isGu ? 'પાણી' : 'Water'}</span>
                </div>
                <div className="text-xs font-semibold text-white mt-1 truncate">
                  {careGuide.watering.frequency.split('/')[0]}
                </div>
              </div>

              <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-400" />
                  <span>{isGu ? 'પાલતુ પ્રાણી' : 'Pets'}</span>
                </div>
                <div className="text-xs font-semibold text-white mt-1 truncate">
                  {benefitsAndUses.toxicity.isToxicToPets
                    ? (isGu ? 'હાનિકારક' : 'Toxic')
                    : (isGu ? 'સુરક્ષિત' : 'Safe')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 SECTION 1: ENVIRONMENTAL & CLIMATE REQUIREMENTS (વાતાવરણની માહિતી) 🌟 */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>{isGu ? 'વાતાવરણ અને આબોહવા અનુકૂળતા' : 'Environmental & Climate Compatibility'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {isGu ? 'મુખ્ય માહિતી' : 'Key Context'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {isGu
                  ? 'આ છોડ માટે યોગ્ય તાપમાન, ભેજ, સૂર્યપ્રકાશ અને ઋતુ અનુસાર માર્ગદર્શન'
                  : 'Optimal temperature, humidity, sunlight, and seasonal requirements'}
              </p>
            </div>
          </div>

          {/* Environmental Match Score Badge */}
          <div className={`px-4 py-2 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${scoreBadge.bg}`}>
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{scoreBadge.text} ({compScore}%)</span>
          </div>
        </div>

        {/* Realtime Local Weather Advice Banner */}
        {weather && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-850 to-slate-850 border border-emerald-800/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>{weather.city}: {weather.temperature}°C | {weather.humidity}% {isGu ? 'ભેજ' : 'humidity'} ({weather.conditionText})</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {isGu ? 'તમારું લાઈવ વાતાવરણ' : 'Your Live Weather'}
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
              💡 {isGu ? environmentalNeeds.weatherAdvice.gujarati : environmentalNeeds.weatherAdvice.english}
            </p>
          </div>
        )}

        {/* 4 Environmental Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Temperature */}
          <div className="bg-slate-850/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Thermometer className="w-4 h-4" />
                  {isGu ? 'આદર્શ તાપમાન' : 'Ideal Temperature'}
                </span>
                <span className="text-[10px] text-slate-500">°C / °F</span>
              </div>
              <div className="text-xl font-extrabold text-white">
                {environmentalNeeds.minTemp}°C - {environmentalNeeds.maxTemp}°C
              </div>
              <p className="text-xs text-slate-300 mt-2">
                {environmentalNeeds.idealTemperature}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              {isGu ? 'અતિશય ઠંડી કે ગરમીમાં સુરક્ષિત રાખો' : 'Shield against extreme frost or dry heat'}
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-slate-850/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Droplets className="w-4 h-4" />
                  {isGu ? 'જરૂરી ભેજ (Humidity)' : 'Ideal Humidity'}
                </span>
                <span className="text-[10px] text-slate-500">%</span>
              </div>
              <div className="text-xl font-extrabold text-white">
                {environmentalNeeds.idealHumidityMin}% - {environmentalNeeds.idealHumidityMax}%
              </div>
              <p className="text-xs text-slate-300 mt-2">
                {environmentalNeeds.humidityRequirement}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              {isGu ? 'સૂકી હવામાં પાંદડા પર પાણી છાંટવું' : 'Mist leaves if air is too dry'}
            </div>
          </div>

          {/* Sunlight */}
          <div className="bg-slate-850/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sun className="w-4 h-4" />
                  {isGu ? 'સૂર્યપ્રકાશ (તડકો)' : 'Sunlight'}
                </span>
                <span className="text-[10px] text-slate-500">{environmentalNeeds.sunlightHours}</span>
              </div>
              <div className="text-lg font-bold text-white line-clamp-1">
                {environmentalNeeds.sunlightType}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                {isGu ? `દૈનિક ${environmentalNeeds.sunlightHours} તડકો શ્રેષ્ઠ રહે છે.` : `Requires ${environmentalNeeds.sunlightHours} daily light.`}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              {isGu ? 'સીધો અથવા આંશિક સૂર્યપ્રકાશ' : 'Direct or indirect sun balance'}
            </div>
          </div>

          {/* Climate Zone & Air Quality */}
          <div className="bg-slate-850/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-teal-400">
                  <Wind className="w-4 h-4" />
                  {isGu ? 'આબોહવા અને હવા' : 'Climate & Air'}
                </span>
                <span className="text-[10px] text-slate-500">Zone</span>
              </div>
              <div className="text-base font-bold text-white truncate">
                {environmentalNeeds.climateZone}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                🍃 {environmentalNeeds.airQualityImpact}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              {isGu ? 'ઓક્સિજન અને હવા શુદ્ધિકરણ' : 'Air purification capability'}
            </div>
          </div>
        </div>

        {/* 3 Seasons Weather Guide (ઉનાળો, ચોમાસું, શિયાળો) */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{isGu ? 'ત્રણ ઋતુઓમાં વાતાવરણ અનુસાર સંભાળ' : '3-Season Climate Care Guide'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Summer Card */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm mb-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>{isGu ? 'ઉનાળો (Summer)' : 'Summer Care'}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {environmentalNeeds.seasonGuide.summer}
              </p>
            </div>

            {/* Monsoon Card */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30">
              <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm mb-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>{isGu ? 'ચોમાસું (Monsoon)' : 'Monsoon Care'}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {environmentalNeeds.seasonGuide.monsoon}
              </p>
            </div>

            {/* Winter Card */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/30">
              <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm mb-2">
                <Wind className="w-4 h-4 text-indigo-400" />
                <span>{isGu ? 'શિયાળો (Winter)' : 'Winter Care'}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {environmentalNeeds.seasonGuide.winter}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💧 SMART WATERING TIPS (તાપમાન અને ભેજ આધારિત સ્માર્ટ વોટરિંગ સલાહ) 💧 */}
      {/* ========================================================================= */}
      <SmartWateringTipsSection
        plantData={plantData}
        weather={weather}
        language={language}
      />

      {/* ========================================================================= */}
      {/* SECTION 2: HEALTH DIAGNOSIS & ORGANIC REMEDIES (રોગ અને દેશી ઉપાયો) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isGu ? 'છોડનું આરોગ્ય અને રોગ નિદાન' : 'Health Diagnosis & Organic Remedies'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isGu
                ? 'પાંદડાની સ્થિતિ, કીટકો, સુકાઈ જવું અને કુદરતી/દેશી ઉપાયો'
                : 'Leaf conditions, pest detection, and traditional Ayurvedic remedies'}
            </p>
          </div>
        </div>

        {/* Health status summary */}
        <div className={`p-4 rounded-2xl border mb-6 ${
          healthStatus.status === 'healthy'
            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
            : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            {healthStatus.status === 'healthy' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {healthStatus.status === 'healthy'
                ? (isGu ? 'છોડ એકદમ સ્વસ્થ અને તંદુરસ્ત છે' : 'Plant is in healthy condition')
                : (isGu ? 'ધ્યાન આપવાની જરૂર છે' : 'Attention needed')}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {isGu ? healthStatus.conditionSummary.gujarati : healthStatus.conditionSummary.english}
          </p>
        </div>

        {/* Detected issues if any */}
        {healthStatus.detectedIssues && healthStatus.detectedIssues.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {isGu ? 'જણાયેલા લક્ષણો અને નિવારણ' : 'Detected Issues & Remedies'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthStatus.detectedIssues.map((issue, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{issue.issue}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      issue.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : issue.severity === 'moderate'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2">
                    <div>
                      <span className="font-semibold text-emerald-400">{isGu ? 'ઉપાય:' : 'Treatment:'} </span>
                      <span>{issue.remedy}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-200">
                      <span className="font-semibold text-emerald-300">🌿 {isGu ? 'ઘરગથ્થુ / દેશી ઉપાય:' : 'Desi Organic Remedy:'} </span>
                      <span>{issue.desiRemedy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{isGu ? 'કોઈ કીટક કે ફૂગ જોવા મળી નથી. નિયમિત પાણી અને સૂર્યપ્રકાશ આપતા રહો.' : 'No fungal or pest infestation detected. Continue standard care.'}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: CARE & MAINTENANCE (સંપૂર્ણ સંભાળ માર્ગદર્શિકા) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isGu ? 'સંપૂર્ણ સારસંભાળ અને માવજત' : 'Complete Plant Care Guide'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isGu ? 'પાણી, માટી, ખાતર અને છાંટણીની ચોક્કસ રીત' : 'Watering, potting soil, fertilizer, and pruning'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Watering Guide */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Droplets className="w-4 h-4" />
              <span>{isGu ? 'પાણી આપવાની રીત (Watering)' : 'Watering Guide'}</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p><strong className="text-white">{isGu ? 'કેટલી વાર:' : 'Frequency:'}</strong> {careGuide.watering.frequency}</p>
              <p><strong className="text-white">{isGu ? 'પદ્ધતિ:' : 'Technique:'}</strong> {careGuide.watering.technique}</p>
              <p className="text-amber-300/90 text-[11px]">⚠️ {careGuide.watering.warningSigns}</p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300 flex items-center justify-between">
              <span>💧 {isGu ? 'તાપમાન-આધારિત સ્માર્ટ ટિપ્સ જુઓ' : 'See Smart Watering Tips above'}</span>
              <span className="font-semibold">{weather?.temperature ? `${weather.temperature}°C / ${weather.humidity}%` : ''}</span>
            </div>
          </div>

          {/* Soil & Potting Mix Guide */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>{isGu ? 'માટી અને કૂંડું (Soil & Potting Mix)' : 'Soil & Potting Mix'}</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p><strong className="text-white">{isGu ? 'માટીનો પ્રકાર:' : 'Soil Type:'}</strong> {careGuide.soil.type}</p>
              <p><strong className="text-white">pH:</strong> {careGuide.soil.phRange}</p>
              <p><strong className="text-white">{isGu ? 'કૂંડા માટે મિશ્રણ:' : 'Mix Formula:'}</strong> {careGuide.soil.mixRecommendation}</p>
            </div>
          </div>

          {/* Fertilizer Guide */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <FlaskConical className="w-4 h-4" />
              <span>{isGu ? 'ખાતર અને પોષણ (Fertilizer)' : 'Fertilizer & Nutrients'}</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p><strong className="text-white">{isGu ? 'સમય:' : 'Schedule:'}</strong> {careGuide.fertilizer.schedule}</p>
              <p><strong className="text-white">{isGu ? 'દેશી/સેન્દ્રિય વિકલ્પો:' : 'Organic Options:'}</strong> {careGuide.fertilizer.organicOptions}</p>
            </div>
          </div>

          {/* Pruning Guide */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Scissors className="w-4 h-4" />
              <span>{isGu ? 'કાપણી અને છાંટણી (Pruning)' : 'Pruning & Trimming'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {careGuide.pruning}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: BENEFITS & USES (આયુર્વેદિક અને ઘરગથ્થુ ઉપયોગ) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medicinal & Household */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>{isGu ? 'આયુર્વેદિક અને ઘરગથ્થુ ફાયદા' : 'Ayurvedic & Household Benefits'}</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <h4 className="font-semibold text-emerald-300 mb-1">
                🌿 {isGu ? 'આયુર્વેદિક / ઔષધીય ગુણો:' : 'Medicinal Properties:'}
              </h4>
              <p>{benefitsAndUses.ayurvedicOrMedicinal}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <h4 className="font-semibold text-teal-300 mb-1">
                🏡 {isGu ? 'ઘરગથ્થુ અને પર્યાવરણીય ઉપયોગ:' : 'Household & Air Quality:'}
              </h4>
              <p>{benefitsAndUses.householdUses}</p>
            </div>
          </div>
        </div>

        {/* Pet Safety & Fun Facts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <span>{isGu ? 'સલામતી અને રસપ્રદ તથ્યો' : 'Safety & Botanical Facts'}</span>
          </h3>

          {/* Pet Safety Box */}
          <div className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
            benefitsAndUses.toxicity.isToxicToPets
              ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
          }`}>
            <h4 className="font-bold flex items-center gap-1.5 mb-1">
              <Heart className="w-4 h-4" />
              <span>
                {benefitsAndUses.toxicity.isToxicToPets
                  ? (isGu ? 'પાલતુ પ્રાણીઓ માટે ચેતવણી' : 'Pet Toxicity Warning')
                  : (isGu ? 'પાલતુ પ્રાણીઓ માટે સુરક્ષિત' : 'Pet Friendly')}
              </span>
            </h4>
            <p className="text-slate-200 text-xs">
              {benefitsAndUses.toxicity.details}
            </p>
          </div>

          {/* Fun facts list */}
          {funFacts && funFacts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
              <h4 className="font-semibold text-amber-300 text-xs mb-2">
                ✨ {isGu ? 'રસપ્રદ તથ્યો:' : 'Interesting Facts:'}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {funFacts.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
