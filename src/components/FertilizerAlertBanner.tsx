import React from 'react';
import {
  FlaskConical,
  AlertTriangle,
  Sparkles,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  Sun,
  CheckCircle2,
} from 'lucide-react';
import { SavedPlant, FertilizerCalculation } from '../types/plant';

interface FertilizerAlertBannerProps {
  duePlants: Array<{ plant: SavedPlant; calculation: FertilizerCalculation }>;
  allPlantsCount: number;
  onFertilizeAllDue: () => void;
  onFertilizePlant: (plantId: string) => void;
  onViewPlant: (plant: SavedPlant) => void;
  language: 'gu' | 'en';
}

export const FertilizerAlertBanner: React.FC<FertilizerAlertBannerProps> = ({
  duePlants,
  allPlantsCount,
  onFertilizeAllDue,
  onFertilizePlant,
  onViewPlant,
  language,
}) => {
  const isGu = language === 'gu';
  const hasDuePlants = duePlants.length > 0;
  const overdueCount = duePlants.filter((p) => p.calculation.status === 'overdue').length;

  if (allPlantsCount === 0) return null;

  return (
    <div className="space-y-4">
      {hasDuePlants ? (
        /* High-Impact Fertilizer Alert Card */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-600/40 p-5 sm:p-7 shadow-2xl shadow-emerald-950/40 text-white animate-fade-in">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Alert Title & Message */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isGu
                      ? `ખાતર આપવાનો સમય (${duePlants.length} છોડ)`
                      : `Fertilizer Due Alert (${duePlants.length} Plants)`}
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

                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{duePlants[0]?.calculation.currentSeason}</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {isGu ? (
                  <>
                    તમારા <span className="text-emerald-400">{duePlants.length} છોડ</span>ને પોષક ખાતરની જરૂર છે!
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400">{duePlants.length} Plants</span> in your garden need nutrition!
                  </>
                )}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {isGu
                  ? `${duePlants[0]?.calculation.seasonalAdvice.gu}`
                  : `${duePlants[0]?.calculation.seasonalAdvice.en}`}
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={onFertilizeAllDue}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{isGu ? 'આ બધાને ખાતર આપ્યું' : 'Fertilize All Due Plants'}</span>
              </button>
            </div>
          </div>

          {/* Due Plants Horizontal Strip */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              {isGu ? 'પોષણ આપો:' : 'Needs Feed:'}
            </span>
            {duePlants.map(({ plant, calculation }) => (
              <div
                key={plant.id}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-850/90 border border-slate-750 shrink-0 text-xs text-white"
              >
                <img
                  src={plant.imageUrl}
                  alt={plant.plantData.plantName.commonEnglish}
                  className="w-7 h-7 rounded-lg object-cover cursor-pointer"
                  onClick={() => onViewPlant(plant)}
                />
                <div>
                  <div
                    className="font-bold cursor-pointer hover:text-emerald-300 truncate max-w-[120px]"
                    onClick={() => onViewPlant(plant)}
                  >
                    {plant.plantData.plantName.gujaratiName}
                  </div>
                  <div className="text-[10px] text-emerald-400 truncate max-w-[140px]">
                    {isGu ? calculation.recommendedFertilizer.gu.split('+')[0] : calculation.recommendedFertilizer.en.split('+')[0]}
                  </div>
                </div>

                <button
                  onClick={() => onFertilizePlant(plant.id)}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title={isGu ? 'ખાતર આપ્યું તે નોંધો' : 'Record fertilizer'}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Nourished Reassurance Banner */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span>{isGu ? 'તમામ છોડમાં પૂરતું સેન્દ્રિય પોષણ છે' : 'All Plants Well-Nourished'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {isGu ? 'પોષક તત્વો સંતુલિત' : 'Balanced Nutrients'}
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                {isGu
                  ? 'ઋતુ અને પ્રજાતિ અનુસાર હાલમાં કોઈ છોડને તાત્કાલિક ખાતર આપવાની જરૂર નથી. નિયમિત માત્રા જાળવો.'
                  : 'Soil nutrition is currently sufficient according to seasonal growth cycle.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
