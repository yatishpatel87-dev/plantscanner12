export interface PlantInfo {
  plantName: {
    gujaratiName: string;
    commonEnglish: string;
    scientificName: string;
    hindiName: string;
    family: string;
  };
  confidenceScore: number;
  isPlant: boolean;
  nonPlantMessage?: string;
  shortOverview: {
    gujarati: string;
    english: string;
  };
  environmentalNeeds: {
    idealTemperature: string;
    minTemp: number;
    maxTemp: number;
    humidityRequirement: string;
    idealHumidityMin: number;
    idealHumidityMax: number;
    sunlightType: string;
    sunlightHours: string;
    seasonGuide: {
      summer: string;
      monsoon: string;
      winter: string;
    };
    climateZone: string;
    airQualityImpact: string;
    weatherCompatibilityScore: number;
    weatherAdvice: {
      gujarati: string;
      english: string;
    };
  };
  careGuide: {
    watering: {
      frequency: string;
      technique: string;
      warningSigns: string;
    };
    soil: {
      type: string;
      phRange: string;
      mixRecommendation: string;
    };
    fertilizer: {
      schedule: string;
      organicOptions: string;
    };
    pruning: string;
  };
  healthStatus: {
    status: 'healthy' | 'issue_detected' | 'critical';
    conditionSummary: {
      gujarati: string;
      english: string;
    };
    detectedIssues: Array<{
      issue: string;
      severity: 'mild' | 'moderate' | 'high';
      remedy: string;
      desiRemedy: string;
    }>;
  };
  benefitsAndUses: {
    ayurvedicOrMedicinal: string;
    householdUses: string;
    toxicity: {
      isToxicToPets: boolean;
      details: string;
    };
  };
  funFacts: string[];
  audioScript: {
    gujarati: string;
    english: string;
  };
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  isDay: boolean;
}

export interface GrowthLogEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD or full timestamp)
  heightCm?: number; // Height in centimeters
  leafCount?: number; // Number of healthy leaves
  notes?: string; // Optional growth observation (e.g. 'નવી કૂંપળ આવી', 'ખાતર આપ્યા પછી વૃદ્ધિ')
}

export type WateringStatus = 'overdue' | 'due' | 'upcoming' | 'hydrated';

export interface WateringCalculation {
  status: WateringStatus;
  baseIntervalDays: number;
  adjustedIntervalDays: number;
  daysSinceLastWatered: number;
  daysUntilNextWatering: number;
  moisturePercentage: number; // 0 to 100
  nextWateringDate: string;
  weatherFactor: number;
  tempAdjustmentExplanationGu: string;
  tempAdjustmentExplanationEn: string;
}

export type FertilizerStatus = 'overdue' | 'due' | 'upcoming' | 'nourished';

export interface FertilizerCalculation {
  status: FertilizerStatus;
  baseIntervalDays: number;
  adjustedIntervalDays: number;
  daysSinceLastFertilized: number;
  daysUntilNextFertilization: number;
  nutrientLevelPercentage: number; // 0 to 100
  nextFertilizerDate: string;
  currentSeason: string;
  recommendedFertilizer: {
    gu: string;
    en: string;
  };
  seasonalAdvice: {
    gu: string;
    en: string;
  };
}

export interface SavedPlant {
  id: string;
  plantData: PlantInfo;
  imageUrl: string;
  scannedAt: string;
  userNotes?: string;
  lastWateredDate?: string;
  waterFrequencyDays?: number;
  customIntervalDays?: number;
  lastFertilizedDate?: string;
  customFertilizerIntervalDays?: number;
  growthLogs?: GrowthLogEntry[];
}



