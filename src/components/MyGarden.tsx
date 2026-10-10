import React, { useState, useMemo } from 'react';
import {
  Flower2,
  Droplets,
  Calendar,
  Trash2,
  Eye,
  Plus,
  Sparkles,
  Check,
  FileText,
  Search,
  TrendingUp,
  Ruler,
  Leaf,
  AlertTriangle,
  SunMedium,
  CheckCircle2,
  Clock,
  Filter,
  Thermometer,
  FlaskConical,
} from 'lucide-react';
import {
  SavedPlant,
  PlantInfo,
  GrowthLogEntry,
  WeatherData,
  WateringCalculation,
  FertilizerCalculation,
} from '../types/plant';
import { PlantGrowthTrackerModal } from './PlantGrowthTrackerModal';
import { WateringAlertBanner } from './WateringAlertBanner';
import { FertilizerAlertBanner } from './FertilizerAlertBanner';
import { calculateWateringSchedule } from '../utils/wateringSchedule';
import { calculateFertilizerSchedule } from '../utils/fertilizerSchedule';

interface MyGardenProps {
  savedPlants: SavedPlant[];
  weather: WeatherData | null;
  onViewPlant: (plant: SavedPlant) => void;
  onDeletePlant: (id: string) => void;
  onUpdateWatering: (id: string) => void;
  onWaterAllDue: () => void;
  onUpdateFertilizer: (id: string) => void;
  onFertilizeAllDue: () => void;
  onSaveNotes: (id: string, notes: string) => void;
  onAddGrowthLog: (plantId: string, entry: Omit<GrowthLogEntry, 'id'>) => void;
  onDeleteGrowthLog: (plantId: string, logId: string) => void;
  onGoToScanner: () => void;
  notificationsEnabled: boolean;
  onRequestNotifications: () => void;
  language: 'gu' | 'en';
}

export const MyGarden: React.FC<MyGardenProps> = ({
  savedPlants,
  weather,
  onViewPlant,
  onDeletePlant,
  onUpdateWatering,
  onWaterAllDue,
  onUpdateFertilizer,
  onFertilizeAllDue,
  onSaveNotes,
  onAddGrowthLog,
  onDeleteGrowthLog,
  onGoToScanner,
  notificationsEnabled,
  onRequestNotifications,
  language,
}) => {
  const isGu = language === 'gu';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'due_water' | 'due_fertilizer' | 'hydrated'>('all');
  const [alertTab, setAlertTab] = useState<'water' | 'fertilizer'>('water');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [selectedGrowthPlantId, setSelectedGrowthPlantId] = useState<string | null>(null);

  const selectedGrowthPlant = savedPlants.find((p) => p.id === selectedGrowthPlantId) || null;

  // Compute watering calculations for all plants
  const plantWateringCalculations = useMemo(() => {
    const map = new Map<string, WateringCalculation>();
    savedPlants.forEach((p) => {
      map.set(p.id, calculateWateringSchedule(p, weather));
    });
    return map;
  }, [savedPlants, weather]);

  // Compute fertilizer calculations for all plants
  const plantFertilizerCalculations = useMemo(() => {
    const map = new Map<string, FertilizerCalculation>();
    savedPlants.forEach((p) => {
      map.set(p.id, calculateFertilizerSchedule(p, weather));
    });
    return map;
  }, [savedPlants, weather]);

  // Extract due / overdue plants for watering alerts
  const dueWaterPlants = useMemo(() => {
    return savedPlants
      .map((p) => ({
        plant: p,
        calculation: plantWateringCalculations.get(p.id)!,
      }))
      .filter((item) => item.calculation && (item.calculation.status === 'due' || item.calculation.status === 'overdue'));
  }, [savedPlants, plantWateringCalculations]);

  // Extract due / overdue plants for fertilizer alerts
  const dueFertilizerPlants = useMemo(() => {
    return savedPlants
      .map((p) => ({
        plant: p,
        calculation: plantFertilizerCalculations.get(p.id)!,
      }))
      .filter((item) => item.calculation && (item.calculation.status === 'due' || item.calculation.status === 'overdue'));
  }, [savedPlants, plantFertilizerCalculations]);

  // Filter plants based on search query and filterMode
  const filteredPlants = useMemo(() => {
    return savedPlants.filter((p) => {
      const q = searchQuery.toLowerCase();
      const gName = p.plantData.plantName.gujaratiName.toLowerCase();
      const eName = p.plantData.plantName.commonEnglish.toLowerCase();
      const sName = p.plantData.plantName.scientificName.toLowerCase();
      const matchesSearch = gName.includes(q) || eName.includes(q) || sName.includes(q);

      if (!matchesSearch) return false;

      const wCalc = plantWateringCalculations.get(p.id);
      const fCalc = plantFertilizerCalculations.get(p.id);

      if (filterMode === 'due_water') {
        return wCalc?.status === 'due' || wCalc?.status === 'overdue';
      }
      if (filterMode === 'due_fertilizer') {
        return fCalc?.status === 'due' || fCalc?.status === 'overdue';
      }
      if (filterMode === 'hydrated') {
        return wCalc?.status === 'hydrated' || wCalc?.status === 'upcoming';
      }
      return true;
    });
  }, [savedPlants, searchQuery, filterMode, plantWateringCalculations, plantFertilizerCalculations]);

  const handleStartEditNotes = (plant: SavedPlant) => {
    setEditingNotesId(plant.id);
    setTempNotes(plant.userNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    onSaveNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
            <Flower2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isGu ? 'તમારો પોતાનો ડિજિટલ બગીચો' : 'Your Personal Green Space'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isGu ? 'મારું ગાર્ડન (My Garden)' : 'My Garden Collection'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isGu
              ? `તાપમાન મુજબ પાણી અને ઋતુ અનુસાર ખાતરનું સમયપત્રક (${savedPlants.length} છોડ)`
              : `Dynamic temperature watering & seasonal fertilizer schedules for ${savedPlants.length} plants`}
          </p>
        </div>

        <button
          onClick={onGoToScanner}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isGu ? 'નવો છોડ સ્કેન કરો' : 'Scan New Plant'}</span>
        </button>
      </div>

      {/* Reminder Alert Section with Tabs (Watering vs Fertilizer) */}
      {savedPlants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-850 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setAlertTab('water')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  alertTab === 'water'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{isGu ? 'પાણી અલર્ટ' : 'Watering Alerts'}</span>
                {dueWaterPlants.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                    {dueWaterPlants.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAlertTab('fertilizer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  alertTab === 'fertilizer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>{isGu ? 'ખાતર રીમાઇન્ડર' : 'Fertilizer Alerts'}</span>
                {dueFertilizerPlants.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-slate-950 text-emerald-300 text-[10px] flex items-center justify-center font-bold">
                    {dueFertilizerPlants.length}
                  </span>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 hidden sm:block">
              💡 {isGu ? 'પ્રજાતિ અને ઋતુ અનુસાર સ્વચાલિત ગણતરી' : 'Species and season based calculations'}
            </div>
          </div>

          {alertTab === 'water' ? (
            <WateringAlertBanner
              duePlants={dueWaterPlants}
              allPlantsCount={savedPlants.length}
              weather={weather}
              onWaterAllDue={onWaterAllDue}
              onWaterPlant={onUpdateWatering}
              onViewPlant={onViewPlant}
              notificationsEnabled={notificationsEnabled}
              onRequestNotifications={onRequestNotifications}
              language={language}
            />
          ) : (
            <FertilizerAlertBanner
              duePlants={dueFertilizerPlants}
              allPlantsCount={savedPlants.length}
              onFertilizeAllDue={onFertilizeAllDue}
              onFertilizePlant={onUpdateFertilizer}
              onViewPlant={onViewPlant}
              language={language}
            />
          )}
        </div>
      )}

      {/* Search and Filters Strip */}
      {savedPlants.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isGu ? 'ગાર્ડનમાં છોડ શોધો...' : 'Search plants in your garden...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isGu ? `બધા (${savedPlants.length})` : `All (${savedPlants.length})`}
            </button>

            <button
              onClick={() => setFilterMode('due_water')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterMode === 'due_water'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:bg-slate-800'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>{isGu ? `પાણી બાકી (${dueWaterPlants.length})` : `Water Due (${dueWaterPlants.length})`}</span>
              {dueWaterPlants.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setFilterMode('due_fertilizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterMode === 'due_fertilizer'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{isGu ? `ખાતર બાકી (${dueFertilizerPlants.length})` : `Feed Due (${dueFertilizerPlants.length})`}</span>
              {dueFertilizerPlants.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setFilterMode('hydrated')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filterMode === 'hydrated'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-400 hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isGu
                  ? `તૃપ્ત (${savedPlants.length - dueWaterPlants.length})`
                  : `Hydrated (${savedPlants.length - dueWaterPlants.length})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {savedPlants.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center max-w-md mx-auto space-y-5 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <Flower2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isGu ? 'તમારું ગાર્ડન હજુ ખાલી છે' : 'Your Garden is Empty'}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {isGu
                ? 'કોઈપણ છોડ સ્કેન કરો અને "ગાર્ડનમાં ઉમેરો" બટન દબાવો જેથી પાણી અને ઋતુ મુજબ ખાતરના સમયપત્રક અહીં સચવાય.'
                : 'Scan any plant and click "Add to Garden" to track temperature watering and seasonal fertilizer schedules here.'}
            </p>
          </div>
          <button
            onClick={onGoToScanner}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/30"
          >
            {isGu ? 'પહેલો છોડ સ્કેન કરો' : 'Scan First Plant'}
          </button>
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          {isGu ? 'આ ફિલ્ટરમાં કોઈ છોડ મળ્યો નથી.' : 'No matching plants found in this filter.'}
        </div>
      ) : (
        /* Plant Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => {
            const { plantName, environmentalNeeds, careGuide } = plant.plantData;
            const isEditingThis = editingNotesId === plant.id;

            // Calculations
            const wCalc = plantWateringCalculations.get(plant.id) || calculateWateringSchedule(plant, weather);
            const fCalc = plantFertilizerCalculations.get(plant.id) || calculateFertilizerSchedule(plant, weather);

            // Latest growth log
            const logs = plant.growthLogs || [];
            const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const lastLog = sorted.length > 0 ? sorted[sorted.length - 1] : null;

            // Visual Status Colors for Watering
            const isWaterDueOrOverdue = wCalc.status === 'due' || wCalc.status === 'overdue';
            const isWaterUpcoming = wCalc.status === 'upcoming';

            // Visual Status Colors for Fertilizer
            const isFertilizerDueOrOverdue = fCalc.status === 'due' || fCalc.status === 'overdue';

            return (
              <div
                key={plant.id}
                className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all ${
                  wCalc.status === 'overdue'
                    ? 'border-rose-600/60 ring-1 ring-rose-500/30'
                    : wCalc.status === 'due'
                    ? 'border-amber-600/60 ring-1 ring-amber-500/30'
                    : isFertilizerDueOrOverdue
                    ? 'border-emerald-600/60 ring-1 ring-emerald-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Photo Header */}
                <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-950">
                  <img
                    src={plant.imageUrl}
                    alt={plantName.commonEnglish}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button
                      onClick={() => onDeletePlant(plant.id)}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700/80 backdrop-blur-sm transition-colors"
                      title={isGu ? 'ગાર્ડનમાંથી કાઢી નાખો' : 'Remove from Garden'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dual Alert Badges Over Image */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {/* Water Badge */}
                    {wCalc.status === 'overdue' ? (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-600/60 backdrop-blur-md flex items-center gap-1 shadow-lg animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>{isGu ? 'પાણીમાં વિલંબ!' : 'Water Overdue!'}</span>
                      </span>
                    ) : wCalc.status === 'due' ? (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/60 backdrop-blur-md flex items-center gap-1 shadow-lg animate-pulse">
                        <Droplets className="w-3 h-3 text-amber-400" />
                        <span>{isGu ? 'આજે પાણી આપો!' : 'Water Today!'}</span>
                      </span>
                    ) : isWaterUpcoming ? (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-yellow-950/80 text-yellow-300 border border-yellow-600/40 backdrop-blur-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span>{isGu ? 'આવતીકાલે પાણી' : 'Water Tomorrow'}</span>
                      </span>
                    ) : null}

                    {/* Fertilizer Badge */}
                    {isFertilizerDueOrOverdue && (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 backdrop-blur-md flex items-center gap-1 shadow-lg animate-pulse">
                        <FlaskConical className="w-3 h-3 text-emerald-400" />
                        <span>{isGu ? 'ખાતર આપવાનો સમય!' : 'Fertilizer Due!'}</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-base drop-shadow">
                      {plantName.gujaratiName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-sm">
                      {environmentalNeeds.weatherCompatibilityScore ?? 85}% {isGu ? 'અનુકૂળ' : 'Match'}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300 italic">
                      {plantName.scientificName} ({plantName.commonEnglish})
                    </p>

                    {/* 1. DYNAMIC WATERING ALERT & SOIL MOISTURE CARD */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        wCalc.status === 'overdue'
                          ? 'bg-rose-950/30 border-rose-800/60'
                          : wCalc.status === 'due'
                          ? 'bg-amber-950/30 border-amber-800/60'
                          : wCalc.status === 'upcoming'
                          ? 'bg-yellow-950/20 border-yellow-800/40'
                          : 'bg-cyan-950/20 border-cyan-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Droplets
                            className={`w-4 h-4 ${
                              isWaterDueOrOverdue
                                ? 'text-amber-400 animate-bounce'
                                : isWaterUpcoming
                                ? 'text-yellow-400'
                                : 'text-cyan-400'
                            }`}
                          />
                          <span
                            className={
                              wCalc.status === 'overdue'
                                ? 'text-rose-300'
                                : wCalc.status === 'due'
                                ? 'text-amber-300'
                                : isWaterUpcoming
                                ? 'text-yellow-300'
                                : 'text-cyan-300'
                            }
                          >
                            {wCalc.status === 'overdue'
                              ? isGu
                                ? 'પાણીમાં વિલંબ!'
                                : 'Watering Overdue!'
                              : wCalc.status === 'due'
                              ? isGu
                                ? 'આજે પાણી આપો'
                                : 'Watering Due'
                              : isWaterUpcoming
                              ? isGu
                                ? 'આવતીકાલે જરૂર પડશે'
                                : 'Due Tomorrow'
                              : isGu
                              ? `હજુ ${wCalc.daysUntilNextWatering} દિવસ ભેજ રહેશે`
                              : `Next in ${wCalc.daysUntilNextWatering} days`}
                          </span>
                        </div>

                        {/* Instant Water Button */}
                        <button
                          onClick={() => onUpdateWatering(plant.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 ${
                            isWaterDueOrOverdue
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-amber-600/30 animate-pulse'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          }`}
                          title={isGu ? 'હમણાં જ પાણી પાયું તે નોંધો' : 'Record watering'}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{isGu ? 'પાણી પાયું' : 'Watered'}</span>
                        </button>
                      </div>

                      {/* Soil Moisture Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                          <span>{isGu ? 'માટીનો ભેજ' : 'Soil Moisture'}</span>
                          <span
                            className={
                              wCalc.moisturePercentage <= 20
                                ? 'text-rose-400 font-bold'
                                : wCalc.moisturePercentage <= 45
                                ? 'text-amber-400 font-bold'
                                : 'text-cyan-400 font-bold'
                            }
                          >
                            {wCalc.moisturePercentage}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              wCalc.moisturePercentage <= 20
                                ? 'bg-rose-500'
                                : wCalc.moisturePercentage <= 45
                                ? 'bg-amber-400'
                                : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                            }`}
                            style={{ width: `${wCalc.moisturePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. DYNAMIC FERTILIZER REMINDER & NUTRITION CARD */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        fCalc.status === 'overdue'
                          ? 'bg-rose-950/25 border-rose-800/50'
                          : fCalc.status === 'due'
                          ? 'bg-emerald-950/40 border-emerald-700/60'
                          : fCalc.status === 'upcoming'
                          ? 'bg-teal-950/20 border-teal-800/40'
                          : 'bg-slate-850/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <FlaskConical
                            className={`w-4 h-4 ${
                              isFertilizerDueOrOverdue
                                ? 'text-emerald-400 animate-bounce'
                                : 'text-teal-400'
                            }`}
                          />
                          <span
                            className={
                              fCalc.status === 'overdue'
                                ? 'text-rose-300'
                                : fCalc.status === 'due'
                                ? 'text-emerald-300'
                                : fCalc.status === 'upcoming'
                                ? 'text-yellow-300'
                                : 'text-slate-300'
                            }
                          >
                            {fCalc.status === 'overdue'
                              ? isGu
                                ? 'ખાતરમાં વિલંબ થયો છે!'
                                : 'Fertilizer Overdue!'
                              : fCalc.status === 'due'
                              ? isGu
                                ? 'ખાતર આપવાનો સમય છે'
                                : 'Fertilizer Due'
                              : fCalc.status === 'upcoming'
                              ? isGu
                                ? `આગામી ${fCalc.daysUntilNextFertilization} દિવસમાં જરૂર`
                                : `Feed in ${fCalc.daysUntilNextFertilization} days`
                              : isGu
                              ? `પૂરતું પોષણ (${fCalc.daysUntilNextFertilization} દિવસ બાકી)`
                              : `Feed in ${fCalc.daysUntilNextFertilization} days`}
                          </span>
                        </div>

                        {/* Instant Record Fertilizer Button */}
                        <button
                          onClick={() => onUpdateFertilizer(plant.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 ${
                            isFertilizerDueOrOverdue
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-emerald-700/30 animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                          }`}
                          title={isGu ? 'હમણાં જ ખાતર આપ્યું તે નોંધો' : 'Record fertilizer applied'}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{isGu ? 'ખાતર આપ્યું' : 'Feed'}</span>
                        </button>
                      </div>

                      {/* Nutrient Level Progress Bar */}
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                          <span>{isGu ? 'જમીનનું પોષક સ્તર' : 'Soil Nutrition'}</span>
                          <span className="text-emerald-400 font-bold">{fCalc.nutrientLevelPercentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${fCalc.nutrientLevelPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Recommended Organic Feed Recipe Pill */}
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-300/90 leading-tight flex items-start gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-medium">{isGu ? 'ભલામણ કરેલ ખાતર:' : 'Recommended:'} </strong>
                          <span>{isGu ? fCalc.recommendedFertilizer.gu : fCalc.recommendedFertilizer.en}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Growth Tracker Summary Pill & Quick Access */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border border-emerald-800/40 flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-emerald-300 block font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isGu ? 'છોડની વૃદ્ધિ (Growth)' : 'Plant Growth'}</span>
                        </span>
                        <span className="text-[11px] text-slate-300 mt-0.5 block">
                          {lastLog ? (
                            <>
                              {lastLog.heightCm !== undefined && <span className="font-bold text-white mr-2">{lastLog.heightCm} cm</span>}
                              {lastLog.leafCount !== undefined && <span className="text-teal-300">{lastLog.leafCount} {isGu ? 'પાન' : 'leaves'}</span>}
                              <span className="text-slate-500 ml-1">({logs.length} {isGu ? 'લોગ' : 'logs'})</span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">{isGu ? 'હજુ કોઈ માપણી નોંધાઈ નથી' : 'No measurements yet'}</span>
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedGrowthPlantId(plant.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{isGu ? 'ચાર્ટ & લોગ' : 'Chart & Log'}</span>
                      </button>
                    </div>

                    {/* User Notes */}
                    <div className="text-xs">
                      {isEditingThis ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder={isGu ? 'તમારી વ્યક્તિગત નોંધ લખો...' : 'Write notes...'}
                            rows={2}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-2 py-1 rounded text-[11px] bg-slate-700 text-slate-300"
                            >
                              {isGu ? 'રદ' : 'Cancel'}
                            </button>
                            <button
                              onClick={() => handleSaveNotes(plant.id)}
                              className="px-2.5 py-1 rounded text-[11px] bg-emerald-600 text-white font-semibold"
                            >
                              {isGu ? 'સાચવો' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditNotes(plant)}
                          className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {plant.userNotes ? (
                            <p className="text-slate-200 line-clamp-2">📝 {plant.userNotes}</p>
                          ) : (
                            <p className="italic text-[11px] text-slate-500">+ {isGu ? 'નોંધ ઉમેરવા ક્લિક કરો' : 'Add personal note'}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Details Action Button */}
                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => onViewPlant(plant)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isGu ? 'સંપૂર્ણ રિપોર્ટ' : 'Full Report'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Growth Tracker & Chart Modal */}
      {selectedGrowthPlant && (
        <PlantGrowthTrackerModal
          plant={selectedGrowthPlant}
          isOpen={Boolean(selectedGrowthPlant)}
          onClose={() => setSelectedGrowthPlantId(null)}
          onAddLog={onAddGrowthLog}
          onDeleteLog={onDeleteGrowthLog}
          language={language}
        />
      )}
    </div>
  );
};
