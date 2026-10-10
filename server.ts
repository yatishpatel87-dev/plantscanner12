import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Server-side initialization of Gemini client per guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface CityClimate {
  nameGu: string;
  nameEn: string;
  lat: number;
  lon: number;
  baseTemp: number;
  baseHumidity: number;
  isCoastal: boolean;
}

const GUJARAT_CITIES: Record<string, CityClimate> = {
  halol: { nameGu: 'હાલોલ - પંચમહાલ', nameEn: 'Halol (Panchmahal)', lat: 22.5020, lon: 73.4730, baseTemp: 32, baseHumidity: 55, isCoastal: false },
  ahmedabad: { nameGu: 'અમદાવાદ', nameEn: 'Ahmedabad', lat: 23.0225, lon: 72.5714, baseTemp: 32, baseHumidity: 52, isCoastal: false },
  surat: { nameGu: 'સુરત', nameEn: 'Surat', lat: 21.1702, lon: 72.8311, baseTemp: 31, baseHumidity: 68, isCoastal: true },
  vadodara: { nameGu: 'વડોદરા', nameEn: 'Vadodara', lat: 22.3072, lon: 73.1812, baseTemp: 32, baseHumidity: 55, isCoastal: false },
  rajkot: { nameGu: 'રાજકોટ', nameEn: 'Rajkot', lat: 22.3039, lon: 70.8022, baseTemp: 33, baseHumidity: 48, isCoastal: false },
  bhavnagar: { nameGu: 'ભાવનગર', nameEn: 'Bhavnagar', lat: 21.7645, lon: 72.1519, baseTemp: 32, baseHumidity: 62, isCoastal: true },
  jamnagar: { nameGu: 'જામનગર', nameEn: 'Jamnagar', lat: 22.4707, lon: 70.0577, baseTemp: 31, baseHumidity: 64, isCoastal: true },
  junagadh: { nameGu: 'જૂનાગઢ', nameEn: 'Junagadh', lat: 21.5222, lon: 70.4579, baseTemp: 32, baseHumidity: 58, isCoastal: false },
  gandhinagar: { nameGu: 'ગાંધીનગર', nameEn: 'Gandhinagar', lat: 23.2156, lon: 72.6369, baseTemp: 32, baseHumidity: 50, isCoastal: false },
  bhuj: { nameGu: 'ભુજ - કચ્છ', nameEn: 'Bhuj (Kutch)', lat: 23.2420, lon: 69.6669, baseTemp: 34, baseHumidity: 42, isCoastal: false },
  anand: { nameGu: 'આણંદ', nameEn: 'Anand', lat: 22.5645, lon: 72.9289, baseTemp: 32, baseHumidity: 54, isCoastal: false },
  bharuch: { nameGu: 'ભરૂચ', nameEn: 'Bharuch', lat: 21.7051, lon: 72.9959, baseTemp: 32, baseHumidity: 65, isCoastal: true },
  navsari: { nameGu: 'નવસારી', nameEn: 'Navsari', lat: 20.9500, lon: 72.9300, baseTemp: 31, baseHumidity: 70, isCoastal: true },
  valsad: { nameGu: 'વલસાડ', nameEn: 'Valsad', lat: 20.6100, lon: 72.9300, baseTemp: 31, baseHumidity: 72, isCoastal: true },
  vapi: { nameGu: 'વાપી', nameEn: 'Vapi', lat: 20.3700, lon: 72.9000, baseTemp: 31, baseHumidity: 70, isCoastal: true },
  porbandar: { nameGu: 'પોરબંદર', nameEn: 'Porbandar', lat: 21.6417, lon: 69.6293, baseTemp: 30, baseHumidity: 72, isCoastal: true },
  mehsana: { nameGu: 'મહેસાણા', nameEn: 'Mehsana', lat: 23.5880, lon: 72.3693, baseTemp: 33, baseHumidity: 46, isCoastal: false },
  morbi: { nameGu: 'મોરબી', nameEn: 'Morbi', lat: 22.8120, lon: 70.8380, baseTemp: 33, baseHumidity: 48, isCoastal: false },
  somnath: { nameGu: 'સોમનાથ - વેરાવળ', nameEn: 'Veraval / Somnath', lat: 20.9000, lon: 70.3700, baseTemp: 30, baseHumidity: 74, isCoastal: true },
  dwarka: { nameGu: 'દ્વારકા', nameEn: 'Dwarka', lat: 22.2442, lon: 68.9685, baseTemp: 29, baseHumidity: 75, isCoastal: true },
  mumbai: { nameGu: 'મુંબઈ', nameEn: 'Mumbai', lat: 19.0760, lon: 72.8777, baseTemp: 31, baseHumidity: 72, isCoastal: true },
  delhi: { nameGu: 'દિલ્હી', nameEn: 'Delhi', lat: 28.6139, lon: 77.2090, baseTemp: 30, baseHumidity: 45, isCoastal: false },
  bengaluru: { nameGu: 'બેંગલુરુ', nameEn: 'Bengaluru', lat: 12.9716, lon: 77.5946, baseTemp: 27, baseHumidity: 60, isCoastal: false },
  pune: { nameGu: 'પુણે', nameEn: 'Pune', lat: 18.5204, lon: 73.8567, baseTemp: 29, baseHumidity: 55, isCoastal: false },
  jaipur: { nameGu: 'જયપુર', nameEn: 'Jaipur', lat: 26.9124, lon: 75.7873, baseTemp: 32, baseHumidity: 40, isCoastal: false },
  hyderabad: { nameGu: 'હૈદરાબાદ', nameEn: 'Hyderabad', lat: 17.3850, lon: 78.4867, baseTemp: 30, baseHumidity: 55, isCoastal: false },
  chennai: { nameGu: 'ચેન્નઈ', nameEn: 'Chennai', lat: 13.0827, lon: 80.2707, baseTemp: 32, baseHumidity: 75, isCoastal: true },
  kolkata: { nameGu: 'કોલકાતા', nameEn: 'Kolkata', lat: 22.5726, lon: 88.3639, baseTemp: 31, baseHumidity: 70, isCoastal: true },
};

function calculateCurrentWeather(cityQuery?: string, lat?: number, lon?: number) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMonth = now.getMonth() + 1;
  const isDay = currentHour >= 6 && currentHour < 19;

  let matchedCity: CityClimate | null = null;
  let displayCityName = 'અમદાવાદ (Ahmedabad)';

  if (cityQuery) {
    const clean = cityQuery.toLowerCase().trim();
    for (const [key, c] of Object.entries(GUJARAT_CITIES)) {
      if (clean.includes(key) || clean.includes(c.nameEn.toLowerCase()) || clean.includes(c.nameGu)) {
        matchedCity = c;
        displayCityName = `${c.nameGu} (${c.nameEn})`;
        break;
      }
    }
  }

  if (!matchedCity && lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
    let minDistance = Infinity;
    for (const c of Object.values(GUJARAT_CITIES)) {
      const dist = Math.hypot(c.lat - lat, c.lon - lon);
      if (dist < minDistance) {
        minDistance = dist;
        matchedCity = c;
      }
    }
    if (matchedCity) {
      displayCityName = cityQuery ? cityQuery : `${matchedCity.nameGu} (${matchedCity.nameEn})`;
    }
  }

  if (!matchedCity) {
    matchedCity = GUJARAT_CITIES.ahmedabad;
    if (cityQuery) {
      displayCityName = cityQuery;
    }
  }

  let seasonalTempOffset = 0;
  let seasonalHumidityOffset = 0;

  if (currentMonth >= 4 && currentMonth <= 6) {
    seasonalTempOffset = 4;
    seasonalHumidityOffset = -10;
  } else if (currentMonth >= 7 && currentMonth <= 9) {
    seasonalTempOffset = -1;
    seasonalHumidityOffset = 18;
  } else if (currentMonth >= 11 || currentMonth <= 1) {
    seasonalTempOffset = -5;
    seasonalHumidityOffset = -8;
  }

  const hourAngle = ((currentHour - 14) / 12) * Math.PI;
  const diurnalOffset = Math.round(3.5 * Math.cos(hourAngle));

  const finalTemp = Math.round(matchedCity.baseTemp + seasonalTempOffset + diurnalOffset);
  const finalHumidity = Math.max(25, Math.min(95, Math.round(matchedCity.baseHumidity + seasonalHumidityOffset - (diurnalOffset * 1.5))));
  const finalWind = Math.round(8 + Math.abs(Math.sin(currentHour)) * 6);

  let conditionText = isDay ? 'સ્વચ્છ આકાશ / Sunny' : 'સ્વચ્છ રાત્રિ / Clear Night';
  let weatherCode = 0;

  if (currentMonth >= 7 && currentMonth <= 9) {
    conditionText = 'આંશિક વાદળછાયું / Partly Cloudy';
    weatherCode = 2;
  } else if (finalHumidity > 75) {
    conditionText = 'ભેજવાળું વાતાવરણ / Humid';
    weatherCode = 1;
  }

  return {
    city: displayCityName,
    temperature: finalTemp,
    humidity: finalHumidity,
    windSpeed: finalWind,
    weatherCode,
    conditionText,
    isDay,
  };
}

// Weather API endpoint
app.get('/api/weather', async (req: Request, res: Response) => {
  const cityQuery = req.query.city ? String(req.query.city) : undefined;
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lon = req.query.lon ? Number(req.query.lon) : undefined;

  const weatherData = calculateCurrentWeather(cityQuery, lat, lon);
  res.json(weatherData);
});

// Plant Scan API endpoint
app.post('/api/scan-plant', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', localWeather } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    let cleanBase64 = imageBase64;
    let effectiveMime = mimeType;

    // Handle remote image URL (e.g. from sample plants gallery)
    if (typeof imageBase64 === 'string' && (imageBase64.startsWith('http://') || imageBase64.startsWith('https://'))) {
      try {
        const imgRes = await fetch(imageBase64);
        if (!imgRes.ok) {
          throw new Error(`Failed to download sample image: ${imgRes.statusText}`);
        }
        const arrayBuf = await imgRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuf).toString('base64');
        effectiveMime = imgRes.headers.get('content-type') || 'image/jpeg';
      } catch (fetchErr: any) {
        console.error('Failed to download image URL:', fetchErr);
        throw new Error('છબી લોડ કરવામાં અસમર્થ. કૃપા કરીને ફોટો અપલોડ કરો.');
      }
    } else {
      // Strip data URL header if present and trim whitespace
      cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '').trim();
    }

    const weatherContext = localWeather
      ? `The user's current local weather is: City: ${localWeather.city}, Temperature: ${localWeather.temperature}°C, Relative Humidity: ${localWeather.humidity}%, Condition: ${localWeather.conditionText}. Compare the plant's ideal environmental needs with this real-time climate and calculate weatherCompatibilityScore (0-100). Provide specific advice on whether the current weather is suitable or needs protective measures (e.g. shade, indoor shift, misting).`
      : `Provide general climate requirements and advice suitable for Indian subcontinental conditions (Gujarat, tropical/subtropical climate).`;

    const prompt = `You are a botanical specialist, horticulturist, and plant pathologist fluent in both Gujarati (ગુજરાતી) and English.
Analyze the provided plant photo thoroughly.

Special Focus:
The user explicitly asked for "વાતાવરણની માહિતી" (Complete environmental and weather conditions information).
Detail everything about temperature, humidity, sunlight, season-wise care (ઉનાળો, ચોમાસું, શિયાળો), and wind/air circulation.
Also diagnose health condition (રોગ, કીટકો, સુકાઈ જવું) and provide natural/desi remedies (લીમડાનું તેલ, ખાટી છાશ, હળદરનું પાણી, વગેરે).

${weatherContext}

Return structured JSON conforming to the requested schema. Ensure Gujarati script is natural, authentic, grammatically correct and easy to read.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: effectiveMime,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPlant: {
              type: Type.BOOLEAN,
              description: 'True if the photo contains a plant, leaf, flower, tree, or succulent.',
            },
            nonPlantMessage: {
              type: Type.STRING,
              description: 'Message if photo does not look like a plant.',
            },
            plantName: {
              type: Type.OBJECT,
              properties: {
                gujaratiName: { type: Type.STRING, description: 'Popular name in Gujarati, e.g. તુલસી' },
                commonEnglish: { type: Type.STRING, description: 'Common name in English, e.g. Holy Basil' },
                scientificName: { type: Type.STRING, description: 'Botanical name in Latin, e.g. Ocimum tenuiflorum' },
                hindiName: { type: Type.STRING, description: 'Hindi name, e.g. तुलसी' },
                family: { type: Type.STRING, description: 'Botanical family, e.g. Lamiaceae' },
              },
              required: ['gujaratiName', 'commonEnglish', 'scientificName', 'hindiName', 'family'],
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Identification confidence percentage between 70 and 99.',
            },
            shortOverview: {
              type: Type.OBJECT,
              properties: {
                gujarati: { type: Type.STRING, description: '2-3 sentence overview in Gujarati' },
                english: { type: Type.STRING, description: '2-3 sentence overview in English' },
              },
              required: ['gujarati', 'english'],
            },
            environmentalNeeds: {
              type: Type.OBJECT,
              properties: {
                idealTemperature: { type: Type.STRING, description: 'Ideal temperature range string with Gujarati note, e.g. 20°C થી 35°C' },
                minTemp: { type: Type.NUMBER, description: 'Minimum safe temperature in Celsius' },
                maxTemp: { type: Type.NUMBER, description: 'Maximum safe temperature in Celsius' },
                humidityRequirement: { type: Type.STRING, description: 'Humidity requirement description, e.g. 50% - 70% મધ્યમથી ઉચ્ચ ભેજ' },
                idealHumidityMin: { type: Type.NUMBER, description: 'Min humidity %' },
                idealHumidityMax: { type: Type.NUMBER, description: 'Max humidity %' },
                sunlightType: { type: Type.STRING, description: 'Sunlight requirement (e.g. સીધો સૂર્યપ્રકાશ / તડકો)' },
                sunlightHours: { type: Type.STRING, description: 'Hours of sunlight per day' },
                seasonGuide: {
                  type: Type.OBJECT,
                  properties: {
                    summer: { type: Type.STRING, description: 'ઉનાળાની ખાસ સંભાળ અને વાતાવરણ અનુકૂલન' },
                    monsoon: { type: Type.STRING, description: 'ચોમાસામાં પાણી અને ભેજ નિયંત્રણ' },
                    winter: { type: Type.STRING, description: 'શિયાળામાં ઠંડી અને ઝાકળથી રક્ષણ' },
                  },
                  required: ['summer', 'monsoon', 'winter'],
                },
                climateZone: { type: Type.STRING, description: 'Climate classification e.g. ઉષ્ણકટિબંધીય (Tropical)' },
                airQualityImpact: { type: Type.STRING, description: 'Air purification or environmental benefit' },
                weatherCompatibilityScore: { type: Type.NUMBER, description: 'Score from 0 to 100 on current weather compatibility' },
                weatherAdvice: {
                  type: Type.OBJECT,
                  properties: {
                    gujarati: { type: Type.STRING, description: 'Actionable advice based on current weather in Gujarati' },
                    english: { type: Type.STRING, description: 'Actionable advice based on current weather in English' },
                  },
                  required: ['gujarati', 'english'],
                },
              },
              required: [
                'idealTemperature',
                'minTemp',
                'maxTemp',
                'humidityRequirement',
                'idealHumidityMin',
                'idealHumidityMax',
                'sunlightType',
                'sunlightHours',
                'seasonGuide',
                'climateZone',
                'airQualityImpact',
                'weatherCompatibilityScore',
                'weatherAdvice',
              ],
            },
            careGuide: {
              type: Type.OBJECT,
              properties: {
                watering: {
                  type: Type.OBJECT,
                  properties: {
                    frequency: { type: Type.STRING, description: 'પાણી આપવાની આવર્તન (Water frequency)' },
                    technique: { type: Type.STRING, description: 'પાણી આપવાની યોગ્ય પદ્ધતિ' },
                    warningSigns: { type: Type.STRING, description: 'વધુ કે ઓછા પાણીના સંકેતો' },
                  },
                  required: ['frequency', 'technique', 'warningSigns'],
                },
                soil: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: 'માટીનો પ્રકાર (Soil type)' },
                    phRange: { type: Type.STRING, description: 'pH રેન્જ' },
                    mixRecommendation: { type: Type.STRING, description: 'કૂંડા માટે શ્રેષ્ઠ માટી મિશ્રણ (Potting mix)' },
                  },
                  required: ['type', 'phRange', 'mixRecommendation'],
                },
                fertilizer: {
                  type: Type.OBJECT,
                  properties: {
                    schedule: { type: Type.STRING, description: 'ખાતર આપવાનો સમય' },
                    organicOptions: { type: Type.STRING, description: 'સેન્દ્રિય/દેશી ખાતરના વિકલ્પો (ગોબર, વર્મીકમ્પોસ્ટ)' },
                  },
                  required: ['schedule', 'organicOptions'],
                },
                pruning: { type: Type.STRING, description: 'કાપણી અને છાંટણી માર્ગદર્શન' },
              },
              required: ['watering', 'soil', 'fertilizer', 'pruning'],
            },
            healthStatus: {
              type: Type.OBJECT,
              properties: {
                status: {
                  type: Type.STRING,
                  enum: ['healthy', 'issue_detected', 'critical'],
                  description: 'Current visual health state of the plant.',
                },
                conditionSummary: {
                  type: Type.OBJECT,
                  properties: {
                    gujarati: { type: Type.STRING, description: 'આરોગ્ય સારાંશ (Gujarati)' },
                    english: { type: Type.STRING, description: 'Health summary (English)' },
                  },
                  required: ['gujarati', 'english'],
                },
                detectedIssues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      issue: { type: Type.STRING, description: 'Detected problem name (e.g. પાંદડા પીળા પડવા, ફૂગ)' },
                      severity: { type: Type.STRING, enum: ['mild', 'moderate', 'high'] },
                      remedy: { type: Type.STRING, description: 'Remedy / Treatment in Gujarati' },
                      desiRemedy: { type: Type.STRING, description: 'Desi/natural home solution' },
                    },
                    required: ['issue', 'severity', 'remedy', 'desiRemedy'],
                  },
                },
              },
              required: ['status', 'conditionSummary', 'detectedIssues'],
            },
            benefitsAndUses: {
              type: Type.OBJECT,
              properties: {
                ayurvedicOrMedicinal: { type: Type.STRING, description: 'આયુર્વેદિક અને સ્વાસ્થ્ય લાભો' },
                householdUses: { type: Type.STRING, description: 'ઘરગથ્થુ અને પર્યાવરણીય ઉપયોગ' },
                toxicity: {
                  type: Type.OBJECT,
                  properties: {
                    isToxicToPets: { type: Type.BOOLEAN, description: 'Is harmful to cats or dogs' },
                    details: { type: Type.STRING, description: 'Toxicity warning details' },
                  },
                  required: ['isToxicToPets', 'details'],
                },
              },
              required: ['ayurvedicOrMedicinal', 'householdUses', 'toxicity'],
            },
            funFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Interesting botanical facts in Gujarati',
            },
            audioScript: {
              type: Type.OBJECT,
              properties: {
                gujarati: { type: Type.STRING, description: 'A conversational 30-second speech summary in Gujarati for text-to-speech audio reader' },
                english: { type: Type.STRING, description: 'Speech summary in English' },
              },
              required: ['gujarati', 'english'],
            },
          },
          required: [
            'isPlant',
            'plantName',
            'confidenceScore',
            'shortOverview',
            'environmentalNeeds',
            'careGuide',
            'healthStatus',
            'benefitsAndUses',
            'funFacts',
            'audioScript',
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No response from AI model');
    }

    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Scan error:', error);
    res.status(500).json({
      error: 'પ્લાન્ટ સ્કેન કરવામાં સમસ્યા આવી છે. કૃપા કરીને ફરી પ્રયાસ કરો.',
      details: error.message || String(error),
    });
  }
});

// Plant Doctor Chat endpoint
app.post('/api/plant-chat', async (req: Request, res: Response) => {
  try {
    const { plantName, userMessage, history = [], language = 'gu' } = req.body;

    const chatContents: any[] = [];

    // System context in prompt
    const systemPrompt = `You are an expert Plant Doctor and agricultural advisor. The user is asking about the plant: "${plantName || 'Plant'}".
Your advice must be practical, friendly, and include traditional/organic remedies (જેમ કે લીમડાનું તેલ, ખાટી છાશ, હળદર, ગોબર ખાતર) along with scientific care.
Provide the response primarily in ${language === 'gu' ? 'Gujarati (ગુજરાતી) with key terms in English' : 'English with Gujarati plant names'}.
Keep the response clear, structured with bullet points if helpful, and supportive.`;

    chatContents.push({
      role: 'user',
      parts: [{ text: systemPrompt + '\n\nPlease acknowledge and get ready to help.' }],
    });
    chatContents.push({
      role: 'model',
      parts: [{ text: language === 'gu' ? 'નમસ્તે! હું તમારા છોડ માટે તૈયાર છું. મને તમારો પ્રશ્ન પૂછો.' : 'Hello! I am ready to help you with your plant. Ask your question!' }],
    });

    // Add prior conversation
    for (const msg of history.slice(-6)) {
      chatContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    // Add user query
    chatContents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ reply: chatResponse.text });
  } catch (err: any) {
    console.error('Plant chat error:', err);
    res.status(500).json({ error: 'ચેટમાં ક્ષતિ આવી.', details: err.message });
  }
});

// Mount Vite or static server
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`🌿 PlantScanner Server running on port ${port}`);
});
