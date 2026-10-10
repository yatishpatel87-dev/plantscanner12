import React from 'react';
import {
  Droplets,
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Thermometer,
  Sparkles,
  ArrowRight,
  SunMedium,
  Check,
} from 'lucide-react';
import { SavedPlant, WeatherData, WateringCalculation } from '../types/plant';

interface WateringAlertBannerProps {
  duePlants: Array<{ plant: SavedPlant; calculation: WateringCalculation }>;
  allPlantsCount: number;
  weather: WeatherData | null;
  onWaterAllDue: () => void;
  onWaterPlant: (plantId: string) => void;
  onViewPlant: (plant: SavedPlant) => void;
  notificationsEnabled: boolean;
  onRequestNotifications: () => void;
  language: 'gu' | 'en';
}

export const WateringAlertBanner: React.FC<WateringAlertBannerProps> = ({
  duePlants,
  allPlantsCount,
  weather,
  onWaterAllDue,
  onWaterPlant,
  onViewPlant,
  notificationsEnabled,
  onRequestNotifications,
  language,
}) => {
  const isGu = language === 'gu';

  const hasDuePlants = duePlants.length > 0;
  const overdueCount = duePlants.filter((p) => p.calculation.status === 'overdue').length;

  if (allPlantsCount === 0) return null;

  return (
    <div className="space-y-4">
      {hasDuePlants ? (
        /* High-Impact Alert Card */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-rose-950/40 border border-amber-600/40 p-5 sm:p-7 shadow-2xl shadow-amber-950/40 text-white animate-fade-in">
          {/* Subtle water glow backdrop */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Alert Title & Message */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isGu
                      ? `પાણી આપવાનો સમય થઈ ગયો છે (${duePlants.length} છોડ)`
                      : `Watering Due Alert (${duePlants.length} Plants)`}
                  </span>
                </span>

                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>
                      {overdueCount} {isGu ? 'વિલંબિત' : 'overdue'}
                    </span>
                  </span>
                )}

                {weather && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                    <SunMedium className="w-3 h-3 text-amber-400" />
                    <span>
                      {weather.city.split(',')[0]}: {weather.temperature}°C
                    </span>
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {isGu ? (
                  <>
                    તમારા <span className="text-amber-400">{duePlants.length} છોડ</span>ને તાત્કાલિક પાણીની જરૂર છે!
                  </>
                ) : (
                  <>
                    <span className="text-amber-400">{duePlants.length} Plants</span> in your garden need watering!
                  </>
                )}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {isGu
                  ? `સ્થાનિક તાપમાન (${weather ? `${weather.temperature}°C` : 'ઉષ્ણ'}) અને પ્રજાતિ અનુસાર જમીનનો ભેજ ઓછો થઈ ગયો છે. માટી સુકાઈ ન જાય તે માટે આજે જ પાણી આપો.`
                  : `Calculated from species requirements and local climate conditions. Soil moisture is depleted.`}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Water All Due Plants */}
              <button
                onClick={onWaterAllDue}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-600/20 active:scale-95"
              >
                <Droplets className="w-4 h-4 fill-slate-950" />
                <span>{isGu ? 'આ બધાને પાણી પાયું' : 'Water All Due Plants'}</span>
              </button>

              {/* Push Notifications Toggle */}
              <button
                onClick={onRequestNotifications}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  notificationsEnabled
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                }`}
                title={isGu ? 'પુશ નોટિફિકેશન સેટિંગ્સ' : 'Push Notification Settings'}
              >
                {notificationsEnabled ? (
                  <>
                    <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                    <span className="hidden sm:inline">{isGu ? 'અલર્ટ સક્રિય' : 'Alerts Active'}</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isGu ? 'નોટિફિકેશન ચાલુ કરો' : 'Enable Push Alerts'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Due Plants Horizontal Quick Strip */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              {isGu ? 'તુરંત સંભાળ:' : 'Due Now:'}
            </span>
            {duePlants.map(({ plant, calculation }) => (
              <div
                key={plant.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-850/90 border border-slate-750 shrink-0 text-xs text-white"
              >
                <img
                  src={plant.imageUrl}
                  alt={plant.plantData.plantName.commonEnglish}
                  className="w-6 h-6 rounded-lg object-cover cursor-pointer"
                  onClick={() => onViewPlant(plant)}
                />
                <span
                  className="font-bold cursor-pointer hover:text-amber-300 truncate max-w-[110px]"
                  onClick={() => onViewPlant(plant)}
                >
                  {plant.plantData.plantName.gujaratiName}
                </span>

                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono">
                  {calculation.status === 'overdue' ? (isGu ? 'વિલંબ' : 'Overdue') : (isGu ? 'આજે' : 'Today')}
                </span>

                <button
                  onClick={() => onWaterPlant(plant.id)}
                  className="p-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                  title={isGu ? 'પાણી પાયું' : 'Water now'}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Serene Hydrated Banner */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span>{isGu ? 'તમામ છોડમાં પૂરતો ભેજ છે' : 'All Plants are Well-Hydrated'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {isGu ? 'યોગ્ય સ્થિતિ' : 'Healthy Moisture'}
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                {isGu
                  ? `હાલના વાતાવરણ (${weather ? `${weather.temperature}°C` : 'સામાન્ય'}) મુજબ અત્યારે કોઈ છોડને તાત્કાલિક પાણી આપવાની જરૂર નથી.`
                  : `Current soil moisture is sufficient based on ambient temperature and species profiles.`}
              </p>
            </div>
          </div>

          <button
            onClick={onRequestNotifications}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium self-start sm:self-center transition-all ${
              notificationsEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isGu ? 'અલર્ટ ચાલુ છે' : 'Alerts Active'}</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <span>{isGu ? 'રીમાઇન્ડર સેટ કરો' : 'Enable Reminders'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
