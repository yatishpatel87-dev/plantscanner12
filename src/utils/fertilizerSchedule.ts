import { SavedPlant, WeatherData, FertilizerCalculation, FertilizerStatus } from '../types/plant';

/**
 * Determines current agricultural/botanical season based on month and local temperature
 */
export const getCurrentSeasonInfo = (weather: WeatherData | null) => {
  const month = new Date().getMonth() + 1; // 1-12
  const temp = weather ? weather.temperature : 28;

  if (month >= 7 && month <= 9) {
    return {
      key: 'monsoon',
      nameGu: 'ચોમાસું (Monsoon)',
      nameEn: 'Monsoon Season',
      multiplier: 0.9,
      adviceGu: 'વરસાદના પાણીથી કૂંડામાંથી પોષકતત્વો ધોવાઈ જાય છે. ફૂગથી બચવા લીમડાનો ખોળ અને વર્મીકમ્પોસ્ટનું હળવું ટોપ-ડ્રેસિંગ આપો.',
      adviceEn: 'Rain leaches soil nutrients. Apply neem cake powder and light vermicompost top-dressing to deter fungal root rot.',
    };
  } else if (month >= 11 || month <= 1 || temp <= 18) {
    return {
      key: 'winter',
      nameGu: 'શિયાળો (Winter / Dormancy)',
      nameEn: 'Winter Dormancy',
      multiplier: 1.5, // 50% less frequent
      adviceGu: 'શિયાળામાં મોટાભાગના છોડ ધીમી વૃદ્ધિ (સુષુપ્ત) અવસ્થામાં હોય છે, તેથી ખાતરની ઓછી જરૂર પડે છે. માત્ર ગુલાબ અને મોસમી ફૂલોને હળવું ખાતર આપો.',
      adviceEn: 'Most plants enter semi-dormancy in cool weather. Reduce fertilization by 50% to prevent root burn. Only feed winter blooms.',
    };
  } else if (month >= 5 && month <= 6 || temp >= 37) {
    return {
      key: 'summer',
      nameGu: 'તીવ્ર ઉનાળો (Summer Heat)',
      nameEn: 'Summer Heat',
      multiplier: 1.25,
      adviceGu: 'ભારે ગરમીમાં માટી ગરમ રહે છે. ક્યારેય બપોરે કે ભારે રાસાયણિક ખાતર ન આપવું. વહેલી સવારે પાતળું પ્રવાહી સેન્દ્રિય ખાતર (જીવામૃત/છાશ) જ આપો.',
      adviceEn: 'High heat stresses roots. Never fertilize in afternoon sun. Use diluted organic liquid manure early in the morning only.',
    };
  } else {
    return {
      key: 'active_growth',
      nameGu: 'વસંત / શરદ (Active Growth Season)',
      nameEn: 'Active Growth Season',
      multiplier: 0.85, // 15% more frequent
      adviceGu: 'નવા પાંદડા અને કળીઓ ફૂટવાનો આ શ્રેષ્ઠ સમય છે. નાઇટ્રોજન, ફોસ્ફરસ અને પોટાશ યુક્ત સેન્દ્રિય ખાતર આપવાથી જોરદાર વિકાસ થશે.',
      adviceEn: 'Peak vegetative and blooming season. Feed balanced organic compost, nitrogen and potassium rich boosters.',
    };
  }
};

/**
 * Extracts baseline fertilizer interval in days and recommended organic feed for plant species
 */
export const getSpeciesFertilizerProfile = (plant: SavedPlant) => {
  if (plant.customFertilizerIntervalDays && plant.customFertilizerIntervalDays > 0) {
    return {
      baseIntervalDays: plant.customFertilizerIntervalDays,
      feedGu: 'કસ્ટમ સેન્દ્રિય ખાતર (વર્મીકમ્પોસ્ટ)',
      feedEn: 'Custom Organic Fertilizer Mix',
    };
  }

  const name = (
    plant.plantData.plantName.gujaratiName +
    ' ' +
    plant.plantData.plantName.commonEnglish +
    ' ' +
    plant.plantData.plantName.scientificName
  ).toLowerCase();

  // Heavy Feeders / Flowering / Roses / Tomatoes
  if (name.includes('rose') || name.includes('ગુલાબ') || name.includes('rosa') || name.includes('tomato')) {
    return {
      baseIntervalDays: 18,
      feedGu: 'વર્મીકમ્પોસ્ટ + સરસવનો ખોળ + કેળાની છાલનું પાણી (પોટાશ માટે)',
      feedEn: 'Vermicompost + Mustard cake liquid + Banana peel tea (high potassium)',
    };
  }

  // Sacred / Medicinal / Tulsi
  if (name.includes('tulsi') || name.includes('તુલસી') || name.includes('ocimum')) {
    return {
      baseIntervalDays: 25,
      feedGu: 'ગાયનું જૂનું ગોબર ખાતર + લીમડાનો ખોળ (કુદરતી જંતુનાશક અને નાઇટ્રોજન)',
      feedEn: 'Well-rotted Cow dung manure + Neem cake powder (natural pesticide & nitrogen)',
    };
  }

  // Large Hardy Trees / Neem
  if (name.includes('neem') || name.includes('લીમડો') || name.includes('azadirachta')) {
    return {
      baseIntervalDays: 60,
      feedGu: 'વર્મીકમ્પોસ્ટ અને લીમડાનો ખોળ કૂંડાની આસપાસ ગુડાઈ કરીને આપો',
      feedEn: 'Vermicompost top-dressed with light soil hoeing',
    };
  }

  // Succulents / Aloe Vera / Snake Plant / Cactus
  if (
    name.includes('aloe') ||
    name.includes('કુંવારપાઠું') ||
    name.includes('snake') ||
    name.includes('સ્નેક') ||
    name.includes('sansevieria') ||
    name.includes('succulent')
  ) {
    return {
      baseIntervalDays: 60,
      feedGu: 'અતિ હળવું પ્રવાહી ખાતર અથવા વર્મીકમ્પોસ્ટનો થોડો પાવડર (2-3 મહિને)',
      feedEn: 'Diluted seaweed liquid or light sprinkle of vermicompost (every 2-3 months)',
    };
  }

  // Money Plant / Pothos / Indoor Foliage
  if (name.includes('pothos') || name.includes('money') || name.includes('મની પ્લાન્ટ')) {
    return {
      baseIntervalDays: 35,
      feedGu: 'સીવીડ (સમુદ્રી શેવાળ) લિક્વિડ સ્પ્રે અથવા 1 ચમચી વર્મીકમ્પોસ્ટ',
      feedEn: 'Liquid seaweed extract spray or 1 tablespoon vermicompost dissolved in water',
    };
  }

  // Default Houseplants
  return {
    baseIntervalDays: 30,
    feedGu: 'સેન્દ્રિય વર્મીકમ્પોસ્ટ + લીમડાનો ખોળ (મહિને એક વાર)',
    feedEn: 'Organic Vermicompost + Neem cake powder (monthly)',
  };
};

/**
 * Calculates current fertilizer schedule combining species baseline with current season
 */
export const calculateFertilizerSchedule = (
  plant: SavedPlant,
  weather: WeatherData | null
): FertilizerCalculation => {
  const seasonInfo = getCurrentSeasonInfo(weather);
  const profile = getSpeciesFertilizerProfile(plant);

  // Apply seasonal multiplier to base interval
  let adjustedIntervalDays = Math.round(profile.baseIntervalDays * seasonInfo.multiplier);
  adjustedIntervalDays = Math.max(10, Math.min(120, adjustedIntervalDays));

  // Days since last fertilized
  const lastDateStr = plant.lastFertilizedDate || plant.scannedAt || new Date().toISOString();
  const lastFertilizedTime = new Date(lastDateStr).getTime();
  const nowTime = new Date().getTime();
  const diffMs = nowTime - lastFertilizedTime;
  const daysSinceLastFertilized = Math.max(0, Math.round((diffMs / (1000 * 60 * 60 * 24)) * 10) / 10);

  const daysUntilNextFertilization = Math.round((adjustedIntervalDays - daysSinceLastFertilized) * 10) / 10;

  // Calculate estimated soil nutrient level percentage
  let nutrientLevelPercentage = 0;
  if (adjustedIntervalDays > 0) {
    const remainingRatio = (adjustedIntervalDays - daysSinceLastFertilized) / adjustedIntervalDays;
    nutrientLevelPercentage = Math.max(0, Math.min(100, Math.round(remainingRatio * 100)));
  }

  // Status
  let status: FertilizerStatus = 'nourished';
  if (daysUntilNextFertilization <= 0) {
    if (daysSinceLastFertilized >= adjustedIntervalDays + 7) {
      status = 'overdue';
    } else {
      status = 'due';
    }
  } else if (daysUntilNextFertilization <= 5) {
    status = 'upcoming';
  } else {
    status = 'nourished';
  }

  const nextDateObj = new Date(lastFertilizedTime + adjustedIntervalDays * 24 * 60 * 60 * 1000);
  const nextFertilizerDate = nextDateObj.toISOString();

  return {
    status,
    baseIntervalDays: profile.baseIntervalDays,
    adjustedIntervalDays,
    daysSinceLastFertilized,
    daysUntilNextFertilization,
    nutrientLevelPercentage,
    nextFertilizerDate,
    currentSeason: seasonInfo.nameGu,
    recommendedFertilizer: {
      gu: profile.feedGu,
      en: profile.feedEn,
    },
    seasonalAdvice: {
      gu: seasonInfo.adviceGu,
      en: seasonInfo.adviceEn,
    },
  };
};
