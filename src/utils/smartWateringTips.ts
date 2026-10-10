import { PlantInfo, WeatherData } from '../types/plant';

export interface SmartWateringAdvice {
  headline: {
    gu: string;
    en: string;
  };
  temperatureAdvice: {
    gu: string;
    en: string;
    badge: string;
    level: 'extreme_heat' | 'hot' | 'mild' | 'cool' | 'cold';
  };
  humidityAdvice: {
    gu: string;
    en: string;
    badge: string;
    level: 'very_high' | 'high' | 'optimal' | 'low';
  };
  bestTimeToWater: {
    gu: string;
    en: string;
    window: string;
  };
  soilMoistureTip: {
    gu: string;
    en: string;
  };
  frequencyModifier: {
    gu: string;
    en: string;
    type: 'increase' | 'decrease' | 'normal' | 'skip';
  };
  actionableTips: Array<{
    icon: 'sun' | 'droplet' | 'shield' | 'clock' | 'thermometer' | 'wind';
    title: { gu: string; en: string };
    desc: { gu: string; en: string };
    highlight?: boolean;
  }>;
}

export const getSmartWateringAdvice = (
  plant: PlantInfo,
  weather: WeatherData | null,
  overrideTemp?: number,
  overrideHumidity?: number
): SmartWateringAdvice => {
  const currentTemp = overrideTemp !== undefined ? overrideTemp : (weather?.temperature ?? 28);
  const currentHumidity = overrideHumidity !== undefined ? overrideHumidity : (weather?.humidity ?? 55);

  const plantNameGu = plant.plantName.gujaratiName || 'આ છોડ';
  const plantNameEn = plant.plantName.commonEnglish || 'this plant';
  const idealMinTemp = plant.environmentalNeeds?.minTemp ?? 18;
  const idealMaxTemp = plant.environmentalNeeds?.maxTemp ?? 35;
  const idealMinHum = plant.environmentalNeeds?.idealHumidityMin ?? 40;
  const idealMaxHum = plant.environmentalNeeds?.idealHumidityMax ?? 70;

  // 1. Temperature Analysis
  let tempLevel: 'extreme_heat' | 'hot' | 'mild' | 'cool' | 'cold';
  let tempAdviceGu = '';
  let tempAdviceEn = '';
  let tempBadge = '';

  if (currentTemp >= 36 || currentTemp > idealMaxTemp + 3) {
    tempLevel = 'extreme_heat';
    tempBadge = 'અતિશય ગરમી (Extreme Heat)';
    tempAdviceGu = `આજે ખૂબ જ ગરમી (${currentTemp}°C) છે, છોડને બપોરના આકરા તડકાથી બચાવી છાંયડામાં રાખો. કૂંડાની માટી ઝડપથી સુકાઈ જતી હોવાથી વહેલી સવારે અથવા સાંજે ઊંડાણપૂર્વક પાણી આપો.`;
    tempAdviceEn = `It is very hot today, ensure your plant stays in shaded area. The temperature (${currentTemp}°C) causes rapid evaporation; deep-water early in the morning or late evening.`;
  } else if (currentTemp >= 30) {
    tempLevel = 'hot';
    tempBadge = 'ઊંચું તાપમાન (Hot Weather)';
    tempAdviceGu = `આજે ખૂબ જ ગરમી (${currentTemp}°C) છે, છોડને બપોરના સમયે છાંયડામાં રાખો. માટી ઝડપથી સુકાય છે તેથી નિયમિત ભેજ તપાસતા રહો.`;
    tempAdviceEn = `It is very hot today, ensure your plant stays in shaded area. Check soil moisture daily as warmth speeds up evaporation.`;
  } else if (currentTemp <= 14 || currentTemp < idealMinTemp - 4) {
    tempLevel = 'cold';
    tempBadge = 'તીવ્ર ઠંડી (Cold Alert)';
    tempAdviceGu = `તાપમાન ઘણું નીચું (${currentTemp}°C) છે. છોડની મૂળિયાં ઠંડા પડી શકે છે, તેથી પાણીની માત્રા અડધી કરી દો અને હુંફાળું પાણી આપો.`;
    tempAdviceEn = `Cold weather detected (${currentTemp}°C). Plant metabolism slows; cut back watering significantly to avoid chilled roots.`;
  } else if (currentTemp <= 20) {
    tempLevel = 'cool';
    tempBadge = 'મંદ ઠંડક (Cool Climate)';
    tempAdviceGu = `વાતાવરણ ઠંડુ (${currentTemp}°C) છે. કૂંડામાં ભેજ લાંબા સમય સુધી સચવાય છે, તેથી સામાન્ય કરતાં ઓછું પાણી આપો.`;
    tempAdviceEn = `Cool climate detected (${currentTemp}°C). Evaporation is sluggish; reduce watering volume and ensure proper pot drainage.`;
  } else {
    tempLevel = 'mild';
    tempBadge = 'આદર્શ તાપમાન (Ideal Warmth)';
    tempAdviceGu = `હાલનું તાપમાન (${currentTemp}°C) ${plantNameGu} માટે અનુકૂળ છે. સામાન્ય માવજત મુજબ પાણી આપો.`;
    tempAdviceEn = `Current temperature (${currentTemp}°C) is in the comfortable comfort zone for ${plantNameEn}. Maintain regular schedule.`;
  }

  // 2. Humidity Analysis
  let humLevel: 'very_high' | 'high' | 'optimal' | 'low';
  let humAdviceGu = '';
  let humAdviceEn = '';
  let humBadge = '';

  if (currentHumidity >= 75 || currentHumidity > idealMaxHum + 10) {
    humLevel = 'very_high';
    humBadge = 'અતિ ભારે ભેજ (High Humidity)';
    humAdviceGu = `હવામાં અતિશય ભેજ (${currentHumidity}%) નોંધાયો છે, પાણી આપવાની આવર્તન ઓછી કરો. કૂંડાની માટી લાંબા સમય સુધી ભીની રહેશે, વધારે પાણી આપવાથી મૂળ સડી શકે છે.`;
    humAdviceEn = `High humidity detected, reduce watering frequency. With ${currentHumidity}% humidity, soil stays damp for days; overwatering can easily trigger root rot or fungal mildew.`;
  } else if (currentHumidity >= 68) {
    humLevel = 'high';
    humBadge = 'ઊંચો ભેજ (Humid)';
    humAdviceGu = `હવામાં વધુ ભેજ (${currentHumidity}%) જણાય છે, પાણી આપવાની આવર્તન ઓછી કરો. માટીની ઉપરની સપાટી 2 ઇંચ સુકાય ત્યાર પછી જ પાણી આપવું.`;
    humAdviceEn = `High humidity detected, reduce watering frequency. Atmosphere retains moisture (${currentHumidity}%); let upper soil dry out before adding more water.`;
  } else if (currentHumidity <= 32 || currentHumidity < idealMinHum - 10) {
    humLevel = 'low';
    humBadge = 'સૂકી હવા (Dry Atmosphere)';
    humAdviceGu = `હવામાં ઘણો ઓછો ભેજ (${currentHumidity}%) છે. પાંદડાના છેડા સુકાઈ ન જાય તે માટે સવારે પાંદડા પર હળવો પાણીનો છંટકાવ (misting) કરો.`;
    humAdviceEn = `Low air humidity detected (${currentHumidity}%). Dry air draws moisture from foliage quickly; consider light leaf misting or a pebble water tray.`;
  } else {
    humLevel = 'optimal';
    humBadge = 'સંતુલિત ભેજ (Balanced Humidity)';
    humAdviceGu = `વાતાવરણમાં ભેજ (${currentHumidity}%) સંતુલિત છે. પાંદડા અને મૂળ યોગ્ય રીતે શ્વસન કરી શકશે.`;
    humAdviceEn = `Atmospheric humidity (${currentHumidity}%) is balanced and well-suited for natural transpiration.`;
  }

  // 3. Overall Headline Summary
  let headlineGu = '';
  let headlineEn = '';

  if (tempLevel === 'extreme_heat' || tempLevel === 'hot') {
    if (humLevel === 'high' || humLevel === 'very_high') {
      headlineGu = `આજે ગરમી (${currentTemp}°C) અને ભેજ (${currentHumidity}%) બંને વધુ છે: છોડને છાંયડામાં રાખો પણ વધુ પડતું પાણી ન આપો.`;
      headlineEn = `Hot and humid today (${currentTemp}°C, ${currentHumidity}%): Keep plant in shaded area and avoid waterlogging.`;
    } else {
      headlineGu = `આજે ખૂબ જ ગરમી છે, છોડને છાંયડાવાળી જગ્યામાં રાખો અને વહેલી સવારે પાણી આપો.`;
      headlineEn = `It is very hot today, ensure your plant stays in shaded area and water early morning.`;
    }
  } else if (humLevel === 'very_high' || humLevel === 'high') {
    headlineGu = `હવામાં વધુ ભેજ છે, પાણી આપવાની આવર્તન ઓછી કરો.`;
    headlineEn = `High humidity detected, reduce watering frequency.`;
  } else if (tempLevel === 'cold') {
    headlineGu = `ઠંડા વાતાવરણના લીધે પાણીની જરૂરિયાત ઘટી છે: માટી સુકાય પછી જ થોડું પાણી આપો.`;
    headlineEn = `Cold weather slows water absorption: water sparingly and protect from cold drafts.`;
  } else if (humLevel === 'low') {
    headlineGu = `સૂકી હવામાં ભેજ જાળવી રાખવા પાંદડા પર છંટકાવ કરો.`;
    headlineEn = `Dry air detected: mist foliage to maintain humidity and hydrate roots.`;
  } else {
    headlineGu = `હાલનું વાતાવરણ આદર્શ છે: નિયમિત શેડ્યુલ મુજબ પાણી આપો.`;
    headlineEn = `Weather conditions are ideal: proceed with standard watering routine.`;
  }

  // 4. Best Time To Water Today
  let bestWindow = '6:00 AM - 8:30 AM';
  let bestTimeGu = 'વહેલી સવારે 6:00 થી 8:30 વચ્ચે (સૂર્યના આકરા તડકા પહેલાં)';
  let bestTimeEn = 'Early morning between 6:00 AM and 8:30 AM before harsh sunlight';

  if (tempLevel === 'cold') {
    bestWindow = '10:00 AM - 12:00 PM';
    bestTimeGu = 'બપોર પહેલાં 10:00 થી 12:00 વચ્ચે, જેથી માટી હળવી ગરમ હોય ત્યારે પાણી મળે.';
    bestTimeEn = 'Mid-morning (10:00 AM - 12:00 PM) when ambient temperature rises slightly.';
  } else if (tempLevel === 'extreme_heat') {
    bestWindow = '5:30 AM - 7:30 AM or 6:30 PM';
    bestTimeGu = 'વહેલી પરોઢે અથવા સાંજ પડ્યા પછી (બપોરના સમયે ક્યારેય પાણી ન આપવું).';
    bestTimeEn = 'Dawn (5:30 AM - 7:30 AM) or after sunset. Never water during peak noon heat.';
  }

  // 5. Soil Moisture Rule
  const soilCheckGu = 'પાણી આપતા પહેલાં આંગળી વડે કૂંડામાં 2 ઇંચ ઊંડે માટી તપાસો. જો માટી ભીની લાગે તો પાણી આપવાનું મુલતવી રાખો.';
  const soilCheckEn = 'Perform the 2-inch knuckle check before pouring. If soil clings damply, delay watering until top layer dries.';

  // 6. Frequency Modifier
  let freqType: 'increase' | 'decrease' | 'normal' | 'skip' = 'normal';
  let freqGu = 'સામાન્ય આવર્તન';
  let freqEn = 'Standard routine';

  if ((tempLevel === 'extreme_heat' || tempLevel === 'hot') && humLevel !== 'very_high') {
    freqType = 'increase';
    freqGu = 'વધારે વાર પાણી આપો (+1 દિવસ વહેલું)';
    freqEn = 'Water more frequently (shorten interval by 1-2 days)';
  } else if (humLevel === 'very_high' || humLevel === 'high' || tempLevel === 'cold') {
    freqType = 'decrease';
    freqGu = 'પાણી આપવાનું મોડું કરો (1-2 દિવસ વિલંબ)';
    freqEn = 'Reduce frequency (extend interval by 1-2 days)';
  }

  // 7. Actionable Tip Cards
  const actionableTips: SmartWateringAdvice['actionableTips'] = [
    {
      icon: 'sun',
      title: {
        gu: 'તડકો અને છાંયડો વ્યવસ્થાપન',
        en: 'Sunlight & Shade Care',
      },
      desc: {
        gu:
          currentTemp >= 32
            ? 'આજે ખૂબ જ ગરમી છે, પાંદડા બળી ન જાય તે માટે છોડને હવાદાર છાંયડામાં ખસેડો.'
            : 'છોડને તેની કુદરતી જરૂરિયાત મુજબ ફિલ્ટર થયેલ સૂર્યપ્રકાશ મળવા દો.',
        en:
          currentTemp >= 32
            ? 'It is very hot today, ensure your plant stays in shaded area to prevent scorched leaves.'
            : 'Position plant to receive balanced, species-appropriate ambient sunlight.',
      },
      highlight: currentTemp >= 32,
    },
    {
      icon: 'droplet',
      title: {
        gu: 'ભેજ અને પાણી નિયમન',
        en: 'Humidity & Watering Rate',
      },
      desc: {
        gu:
          currentHumidity >= 68
            ? 'હવામાં વધુ ભેજ હોવાથી પાણી આપવાની આવર્તન ઓછી કરો. કૂંડાના નિકાલ છિદ્ર (drainage) તપાસો.'
            : currentHumidity <= 35
            ? 'સૂકા વાતાવરણમાં પાંદડા પર સવારે પાણીનો છંટકાવ કરવાથી છોડ તાજગી અનુભવશે.'
            : 'ભેજનું પ્રમાણ સંતુલિત છે, કૂંડામાં પાણી ભરાઈ ન રહે તેનું ધ્યાન રાખો.',
        en:
          currentHumidity >= 68
            ? 'High humidity detected, reduce watering frequency to protect root health.'
            : currentHumidity <= 35
            ? 'Low humidity detected; mist foliage gently in morning to counter dry air.'
            : 'Optimal air moisture; water evenly until slight drainage occurs.',
      },
      highlight: currentHumidity >= 68 || currentHumidity <= 35,
    },
    {
      icon: 'clock',
      title: {
        gu: 'આજના દિવસ માટે શ્રેષ્ઠ સમય',
        en: 'Optimal Time Window',
      },
      desc: {
        gu: bestTimeGu,
        en: bestTimeEn,
      },
    },
    {
      icon: 'shield',
      title: {
        gu: 'મૂળિયાં સુરક્ષા (2-ઇંચ નિયમ)',
        en: 'Root Guard: 2-Inch Rule',
      },
      desc: {
        gu: soilCheckGu,
        en: soilCheckEn,
      },
    },
  ];

  return {
    headline: {
      gu: headlineGu,
      en: headlineEn,
    },
    temperatureAdvice: {
      gu: tempAdviceGu,
      en: tempAdviceEn,
      badge: tempBadge,
      level: tempLevel,
    },
    humidityAdvice: {
      gu: humAdviceGu,
      en: humAdviceEn,
      badge: humBadge,
      level: humLevel,
    },
    bestTimeToWater: {
      gu: bestTimeGu,
      en: bestTimeEn,
      window: bestWindow,
    },
    soilMoistureTip: {
      gu: soilCheckGu,
      en: soilCheckEn,
    },
    frequencyModifier: {
      gu: freqGu,
      en: freqEn,
      type: freqType,
    },
    actionableTips,
  };
};
