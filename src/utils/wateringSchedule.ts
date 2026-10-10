import { SavedPlant, WeatherData, WateringCalculation, WateringStatus } from '../types/plant';

/**
 * Extracts a sensible base watering interval in days from species information
 */
export const getBaseWateringInterval = (plant: SavedPlant): number => {
  if (plant.customIntervalDays && plant.customIntervalDays > 0) {
    return plant.customIntervalDays;
  }
  if (plant.waterFrequencyDays && plant.waterFrequencyDays > 0) {
    return plant.waterFrequencyDays;
  }

  const name = (
    plant.plantData.plantName.gujaratiName +
    ' ' +
    plant.plantData.plantName.commonEnglish +
    ' ' +
    plant.plantData.plantName.scientificName
  ).toLowerCase();

  const freqText = (plant.plantData.careGuide?.watering?.frequency || '').toLowerCase();

  // Succulents / Cacti / Low water plants
  if (
    name.includes('aloe') ||
    name.includes('કુંવારપાઠું') ||
    name.includes('snake') ||
    name.includes('સ્નેક') ||
    name.includes('sansevieria') ||
    name.includes('cactus') ||
    name.includes('કેક્ટસ') ||
    name.includes('succulent')
  ) {
    return 10;
  }

  // Large Hardy Trees / Neem
  if (name.includes('neem') || name.includes('લીમડો') || name.includes('azadirachta')) {
    return 4;
  }

  // Holy Basil / Tulsi / Garden Shrubs
  if (name.includes('tulsi') || name.includes('તુલસી') || name.includes('ocimum')) {
    return 2.5; // Every 2-3 days
  }

  // Rose
  if (name.includes('rose') || name.includes('ગુલાબ') || name.includes('rosa')) {
    return 2.5;
  }

  // Money plant / Pothos
  if (name.includes('pothos') || name.includes('money') || name.includes('મની પ્લાન્ટ')) {
    return 4;
  }

  // Text analysis fallback
  if (freqText.includes('રોજ') || freqText.includes('daily') || freqText.includes('દરરોજ')) {
    return 1;
  }
  if (freqText.includes('2-3') || freqText.includes('બે થી ત્રણ')) {
    return 2.5;
  }
  if (freqText.includes('અઠવાડિયામાં 1') || freqText.includes('once a week')) {
    return 7;
  }
  if (freqText.includes('અઠવાડિયામાં 2') || freqText.includes('twice a week')) {
    return 3.5;
  }
  if (freqText.includes('10') || freqText.includes('12')) {
    return 10;
  }

  return 3; // Default sensible average for houseplants
};

/**
 * Calculates real-time watering needs by combining species baseline with local weather conditions
 */
export const calculateWateringSchedule = (
  plant: SavedPlant,
  weather: WeatherData | null
): WateringCalculation => {
  const baseIntervalDays = getBaseWateringInterval(plant);

  let temp = 28; // Default mild temperature in Celsius
  let humidity = 55; // Default humidity %

  if (weather) {
    temp = weather.temperature;
    humidity = weather.humidity;
  }

  // Evaporation / Heat adjustment multiplier
  // Lower multiplier = dries faster = water more frequently
  // Higher multiplier = dries slower = water less frequently
  let weatherFactor = 1.0;
  let tempExplanationGu = '';
  let tempExplanationEn = '';

  if (temp >= 38) {
    weatherFactor = 0.6;
    tempExplanationGu = `તીવ્ર ગરમી (${temp}°C) હોવાથી કૂંડાની માટી ઝડપથી સુકાઈ જાય છે, તેથી પાણી આપવાનો ગાળો 40% ટૂંકો કરવામાં આવ્યો છે.`;
    tempExplanationEn = `Extreme heat (${temp}°C) accelerates soil drying; interval shortened by 40%.`;
  } else if (temp >= 32) {
    weatherFactor = 0.75;
    tempExplanationGu = `ઉનાળાનું ઊંચું તાપમાન (${temp}°C) હોવાથી બાષ્પીભવન ઝડપી બને છે. પાણીની જરૂરિયાત વધી છે.`;
    tempExplanationEn = `Warm temperature (${temp}°C) speeds evaporation; watering frequency increased.`;
  } else if (temp <= 16) {
    weatherFactor = 1.4;
    tempExplanationGu = `શિયાળાની ઠંડી (${temp}°C) ના કારણે માટીમાં લાંબો સમય ભેજ રહે છે, તેથી વધુ પાણીથી બચવા સમયગાળો વધાર્યો છે.`;
    tempExplanationEn = `Cool climate (${temp}°C) slows evaporation; schedule extended to avoid root rot.`;
  } else if (temp <= 22) {
    weatherFactor = 1.2;
    tempExplanationGu = `મંદ ઠંડું વાતાવરણ (${temp}°C) હોવાથી સામાન્ય કરતાં થોડું ઓછું પાણી જરૂરી છે.`;
    tempExplanationEn = `Mild cool climate (${temp}°C) retains moisture longer.`;
  } else {
    weatherFactor = 1.0;
    tempExplanationGu = `અનુકૂળ તાપમાન (${temp}°C) છે, સામાન્ય માવજત મુજબ પાણી આપો.`;
    tempExplanationEn = `Optimal temperature (${temp}°C); standard watering schedule applies.`;
  }

  // Humidity adjustment
  if (humidity >= 75) {
    weatherFactor *= 1.2;
    tempExplanationGu += ` હવામાં વધુ ભેજ (${humidity}%) છે.`;
    tempExplanationEn += ` High air humidity (${humidity}%).`;
  } else if (humidity <= 30) {
    weatherFactor *= 0.85;
    tempExplanationGu += ` સૂકી હવા (${humidity}% ભેજ) ના લીધે વધારાનું પાણી જરૂરી છે.`;
    tempExplanationEn += ` Dry air (${humidity}% humidity) increases water demand.`;
  }

  // Calculate adjusted interval (bounded between 1 day and 20 days)
  let adjustedIntervalDays = Math.round(baseIntervalDays * weatherFactor * 10) / 10;
  adjustedIntervalDays = Math.max(1, Math.min(20, adjustedIntervalDays));

  // Calculate days elapsed since last watered
  const lastDateStr = plant.lastWateredDate || plant.scannedAt || new Date().toISOString();
  const lastWateredTime = new Date(lastDateStr).getTime();
  const nowTime = new Date().getTime();
  const diffMs = nowTime - lastWateredTime;
  const daysSinceLastWatered = Math.max(0, Math.round((diffMs / (1000 * 60 * 60 * 24)) * 10) / 10);

  const daysUntilNextWatering = Math.round((adjustedIntervalDays - daysSinceLastWatered) * 10) / 10;

  // Calculate estimated remaining moisture %
  let moisturePercentage = 0;
  if (adjustedIntervalDays > 0) {
    const remainingRatio = (adjustedIntervalDays - daysSinceLastWatered) / adjustedIntervalDays;
    moisturePercentage = Math.max(0, Math.min(100, Math.round(remainingRatio * 100)));
  }

  // Determine alert status
  let status: WateringStatus = 'hydrated';
  if (daysUntilNextWatering <= 0) {
    if (daysSinceLastWatered >= adjustedIntervalDays + 1) {
      status = 'overdue';
    } else {
      status = 'due';
    }
  } else if (daysUntilNextWatering <= 1.2) {
    status = 'upcoming';
  } else {
    status = 'hydrated';
  }

  // Next watering formatted date
  const nextDateObj = new Date(lastWateredTime + adjustedIntervalDays * 24 * 60 * 60 * 1000);
  const nextWateringDate = nextDateObj.toISOString();

  return {
    status,
    baseIntervalDays,
    adjustedIntervalDays,
    daysSinceLastWatered,
    daysUntilNextWatering,
    moisturePercentage,
    nextWateringDate,
    weatherFactor: Math.round(weatherFactor * 100) / 100,
    tempAdjustmentExplanationGu: tempExplanationGu,
    tempAdjustmentExplanationEn: tempExplanationEn,
  };
};
