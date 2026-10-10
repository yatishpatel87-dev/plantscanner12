/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlantScanner } from './components/PlantScanner';
import { PlantDetailsView } from './components/PlantDetailsView';
import { ClimateMatcherTool } from './components/ClimateMatcherTool';
import { MyGarden } from './components/MyGarden';
import { PlantDoctorChat } from './components/PlantDoctorChat';
import { WeatherWidgetModal } from './components/WeatherWidgetModal';
import { PlantInfo, WeatherData, SavedPlant, GrowthLogEntry } from './types/plant';
import { SamplePlant } from './data/samplePlants';
import { PlantGrowthTrackerModal } from './components/PlantGrowthTrackerModal';
import { calculateWateringSchedule } from './utils/wateringSchedule';
import { calculateFertilizerSchedule } from './utils/fertilizerSchedule';
import {
  areNotificationsEnabled,
  requestNotificationPermission,
  sendWateringPushNotification,
  playNotificationChime,
} from './utils/notification';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'gu' | 'en'>('gu');
  const [activeTab, setActiveTab] = useState<'scanner' | 'climate' | 'garden' | 'doctor'>('scanner');

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPlant, setScannedPlant] = useState<PlantInfo | null>(null);
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Garden & Notifications state
  const [savedPlants, setSavedPlants] = useState<SavedPlant[]>([]);
  const [doctorPlantName, setDoctorPlantName] = useState<string>('');
  const [growthModalPlantId, setGrowthModalPlantId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => areNotificationsEnabled());

  // Load saved plants from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('plantscanner_garden');
      if (stored) {
        setSavedPlants(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved plants:', e);
    }
  }, []);

  // Save to localStorage when updated
  const persistGarden = (newList: SavedPlant[]) => {
    setSavedPlants(newList);
    try {
      localStorage.setItem('plantscanner_garden', JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save plants to localStorage:', e);
    }
  };

  // Initial weather load (Defaults to Halol, Panchmahal)
  useEffect(() => {
    fetchWeatherByCity('Halol');

    // Attempt geolocation gently if permitted
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Keep Halol default
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const fetchWeatherByCity = async (cityName: string) => {
    setIsWeatherLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setIsWeatherLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error('Error fetching weather by coords:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const handleDetectLocation = () => {
    setLocationNotice(null);
    if (!('geolocation' in navigator)) {
      setLocationNotice(
        language === 'gu'
          ? 'તમારા બ્રાઉઝરમાં GPS સપોર્ટ નથી.'
          : 'Geolocation is not supported in this browser.'
      );
      return;
    }
    setIsWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        setIsWeatherModalOpen(false);
        setLocationNotice(null);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setIsWeatherLoading(false);
        setLocationNotice(
          language === 'gu'
            ? 'GPS લોકેશન પરવાનગી મળી નથી. કૃપા કરીને નીચે આપેલા શહેરોમાંથી પસંદ કરો.'
            : 'Could not access GPS. Please select a city from the list.'
        );
      },
      { timeout: 10000 }
    );
  };

  // Handle Plant Scan
  const handleScan = async (imageBase64: string, previewUrl: string) => {
    setIsScanning(true);
    setScanError(null);
    setScannedImageUrl(previewUrl);

    try {
      const response = await fetch('/api/scan-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: 'image/jpeg',
          localWeather: weather
            ? {
                city: weather.city,
                temperature: weather.temperature,
                humidity: weather.humidity,
                conditionText: weather.conditionText,
              }
            : undefined,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scan failed');
      }

      const plantData: PlantInfo = await response.json();
      setScannedPlant(plantData);
      setActiveTab('scanner');
    } catch (err: any) {
      console.error('Plant scanning failed:', err);
      setScanError(
        err.message ||
          (language === 'gu'
            ? 'પ્લાન્ટ સ્કેન કરવામાં ક્ષતિ આવી છે. કૃપા કરીને સ્પષ્ટ ફોટો ફરી મોકલો.'
            : 'Plant scan failed. Please try again with a clearer photo.')
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToGarden = (plant: PlantInfo, image: string) => {
    const newEntry: SavedPlant = {
      id: Date.now().toString(),
      plantData: plant,
      imageUrl: image,
      scannedAt: new Date().toISOString(),
      lastWateredDate: new Date().toISOString(),
    };
    persistGarden([newEntry, ...savedPlants]);
  };

  const handleDeletePlant = (id: string) => {
    persistGarden(savedPlants.filter((p) => p.id !== id));
  };

  const handleUpdateWatering = (id: string) => {
    persistGarden(
      savedPlants.map((p) =>
        p.id === id ? { ...p, lastWateredDate: new Date().toISOString() } : p
      )
    );
  };

  const handleSaveNotes = (id: string, notes: string) => {
    persistGarden(
      savedPlants.map((p) => (p.id === id ? { ...p, userNotes: notes } : p))
    );
  };

  const handleAddGrowthLog = (plantId: string, entry: Omit<GrowthLogEntry, 'id'>) => {
    const newLog: GrowthLogEntry = {
      id: Date.now().toString(),
      ...entry,
    };
    persistGarden(
      savedPlants.map((p) => {
        if (p.id !== plantId) return p;
        const currentLogs = p.growthLogs || [];
        return {
          ...p,
          growthLogs: [...currentLogs, newLog],
        };
      })
    );
  };

  const handleDeleteGrowthLog = (plantId: string, logId: string) => {
    persistGarden(
      savedPlants.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          growthLogs: (p.growthLogs || []).filter((l) => l.id !== logId),
        };
      })
    );
  };

  const handleAskDoctor = (plantName: string) => {
    setDoctorPlantName(plantName);
    setActiveTab('doctor');
  };

  const handleSelectSampleFromClimate = async (sample: SamplePlant) => {
    try {
      const res = await fetch(sample.imageUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleScan(base64, sample.imageUrl);
      };
      reader.readAsDataURL(blob);
    } catch {
      handleScan(sample.imageUrl, sample.imageUrl);
    }
  };

  const handleScanAnother = () => {
    setScannedPlant(null);
    setScannedImageUrl(null);
    setScanError(null);
  };

  const isCurrentPlantSaved = Boolean(
    scannedPlant &&
      savedPlants.some(
        (p) =>
          p.plantData.plantName.scientificName ===
          scannedPlant.plantName.scientificName
      )
  );

  // Compute total number of plants currently due or overdue for watering
  const dueWaterCount = React.useMemo(() => {
    return savedPlants.filter((p) => {
      const calc = calculateWateringSchedule(p, weather);
      return calc.status === 'due' || calc.status === 'overdue';
    }).length;
  }, [savedPlants, weather]);

  // Compute total number of plants currently due or overdue for fertilization
  const dueFertilizerCount = React.useMemo(() => {
    return savedPlants.filter((p) => {
      const calc = calculateFertilizerSchedule(p, weather);
      return calc.status === 'due' || calc.status === 'overdue';
    }).length;
  }, [savedPlants, weather]);

  // Batch water all due plants
  const handleWaterAllDue = () => {
    const nowStr = new Date().toISOString();
    persistGarden(
      savedPlants.map((p) => {
        const calc = calculateWateringSchedule(p, weather);
        if (calc.status === 'due' || calc.status === 'overdue') {
          return { ...p, lastWateredDate: nowStr };
        }
        return p;
      })
    );
    playNotificationChime();
  };

  // Record fertilization for a single plant
  const handleUpdateFertilizer = (id: string) => {
    const nowStr = new Date().toISOString();
    persistGarden(
      savedPlants.map((p) =>
        p.id === id ? { ...p, lastFertilizedDate: nowStr } : p
      )
    );
    playNotificationChime();
  };

  // Batch fertilize all due plants
  const handleFertilizeAllDue = () => {
    const nowStr = new Date().toISOString();
    persistGarden(
      savedPlants.map((p) => {
        const calc = calculateFertilizerSchedule(p, weather);
        if (calc.status === 'due' || calc.status === 'overdue') {
          return { ...p, lastFertilizedDate: nowStr };
        }
        return p;
      })
    );
    playNotificationChime();
  };

  // Push notifications permission request and dispatch
  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      playNotificationChime();
      const dueWaterList = savedPlants.filter((p) => {
        const calc = calculateWateringSchedule(p, weather);
        return calc.status === 'due' || calc.status === 'overdue';
      });

      const dueFeedList = savedPlants.filter((p) => {
        const calc = calculateFertilizerSchedule(p, weather);
        return calc.status === 'due' || calc.status === 'overdue';
      });

      if (dueWaterList.length > 0 || dueFeedList.length > 0) {
        sendWateringPushNotification(
          language === 'gu' ? '🚨 બગીચા સંભાળ અલર્ટ' : '🚨 Garden Care Alert',
          language === 'gu'
            ? `${dueWaterList.length > 0 ? `${dueWaterList.length} છોડને પાણી ` : ''}${dueFeedList.length > 0 ? `અને ${dueFeedList.length} છોડને ખાતરની ` : ''}જરૂર છે!`
            : `${dueWaterList.length} plants need water, ${dueFeedList.length} plants need fertilizer!`,
          dueWaterList[0]?.imageUrl || dueFeedList[0]?.imageUrl
        );
      } else {
        sendWateringPushNotification(
          language === 'gu' ? '🌿 પ્લાન્ટ સ્કેનર રીમાઇન્ડર' : '🌿 PlantScanner Reminders',
          language === 'gu'
            ? 'હવામાન અને ઋતુ આધારિત પાણી અને ખાતરના અલર્ટ સક્રિય થયા છે!'
            : 'Climate and seasonal care reminders are active!'
        );
      }
    } else {
      setScanError(
        language === 'gu'
          ? 'નોટિફિકેશન પરવાનગી આપવામાં આવી નથી. તમે બ્રાઉઝર સેટિંગ્સમાંથી પરવાનગી આપી શકો છો.'
          : 'Notification permission was not granted in browser settings.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If moving away from scanner without scan, don't clear
        }}
        language={language}
        setLanguage={setLanguage}
        weather={weather}
        gardenCount={savedPlants.length}
        dueWaterCount={dueWaterCount}
        dueFertilizerCount={dueFertilizerCount}
        onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Error notification banner if any */}
        {scanError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{scanError}</span>
            </div>
            <button
              onClick={() => setScanError(null)}
              className="p-1 rounded-lg hover:bg-rose-900/50 text-rose-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab 1: Scanner View */}
        {activeTab === 'scanner' && (
          <>
            {scannedPlant && scannedImageUrl ? (
              <PlantDetailsView
                plantData={scannedPlant}
                imageUrl={scannedImageUrl}
                weather={weather}
                language={language}
                onSaveToGarden={handleSaveToGarden}
                isSaved={isCurrentPlantSaved}
                onAskDoctor={handleAskDoctor}
                onScanAnother={handleScanAnother}
                onOpenGrowthTracker={
                  savedPlants.find(
                    (p) =>
                      p.plantData.plantName.scientificName ===
                      scannedPlant.plantName.scientificName
                  )
                    ? () => {
                        const match = savedPlants.find(
                          (p) =>
                            p.plantData.plantName.scientificName ===
                            scannedPlant.plantName.scientificName
                        );
                        if (match) setGrowthModalPlantId(match.id);
                      }
                    : undefined
                }
              />
            ) : (
              <PlantScanner
                onScan={handleScan}
                isScanning={isScanning}
                weather={weather}
                language={language}
              />
            )}
          </>
        )}

        {/* Tab 2: Climate & Weather Guide */}
        {activeTab === 'climate' && (
          <ClimateMatcherTool
            weather={weather}
            language={language}
            onSelectPlantToScan={handleSelectSampleFromClimate}
            onOpenWeatherModal={() => setIsWeatherModalOpen(true)}
          />
        )}

        {/* Tab 3: My Garden */}
        {activeTab === 'garden' && (
          <MyGarden
            savedPlants={savedPlants}
            weather={weather}
            onViewPlant={(saved) => {
              setScannedPlant(saved.plantData);
              setScannedImageUrl(saved.imageUrl);
              setActiveTab('scanner');
            }}
            onDeletePlant={handleDeletePlant}
            onUpdateWatering={(id) => {
              handleUpdateWatering(id);
              playNotificationChime();
            }}
            onWaterAllDue={handleWaterAllDue}
            onUpdateFertilizer={handleUpdateFertilizer}
            onFertilizeAllDue={handleFertilizeAllDue}
            onSaveNotes={handleSaveNotes}
            onAddGrowthLog={handleAddGrowthLog}
            onDeleteGrowthLog={handleDeleteGrowthLog}
            onGoToScanner={() => {
              handleScanAnother();
              setActiveTab('scanner');
            }}
            notificationsEnabled={notificationsEnabled}
            onRequestNotifications={handleRequestNotifications}
            language={language}
          />
        )}

        {/* Tab 4: Plant Doctor Chat */}
        {activeTab === 'doctor' && (
          <PlantDoctorChat
            initialPlantName={doctorPlantName}
            language={language}
          />
        )}
      </main>

      {/* Weather Selector Modal */}
      <WeatherWidgetModal
        isOpen={isWeatherModalOpen}
        onClose={() => {
          setIsWeatherModalOpen(false);
          setLocationNotice(null);
        }}
        weather={weather}
        onSelectCity={(city) => {
          fetchWeatherByCity(city);
          setIsWeatherModalOpen(false);
          setLocationNotice(null);
        }}
        onDetectLocation={handleDetectLocation}
        isLoading={isWeatherLoading}
        language={language}
        errorMessage={locationNotice}
      />

      {/* Growth Tracker & Chart Modal */}
      {growthModalPlantId && (() => {
        const targetPlant = savedPlants.find((p) => p.id === growthModalPlantId);
        if (!targetPlant) return null;
        return (
          <PlantGrowthTrackerModal
            plant={targetPlant}
            isOpen={Boolean(targetPlant)}
            onClose={() => setGrowthModalPlantId(null)}
            onAddLog={handleAddGrowthLog}
            onDeleteLog={handleDeleteGrowthLog}
            language={language}
          />
        );
      })()}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">
              {language === 'gu' ? 'પ્લાન્ટ સ્કેનર AI' : 'PlantScanner AI'}
            </span>
            <span>—</span>
            <span>
              {language === 'gu'
                ? 'છોડ ઓળખ, આબોહવા અનુકૂળતા અને સંભાળ માર્ગદર્શિકા'
                : 'Botanical Identification & Climate Care'}
            </span>
          </div>
          <div>
            <span>
              {language === 'gu'
                ? 'વાતાવરણ ડેટા: Open-Meteo & AI Powered'
                : 'Climate Data: Open-Meteo & AI Powered'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
