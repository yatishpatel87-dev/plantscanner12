import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  SunMedium,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_PLANTS, SamplePlant } from '../data/samplePlants';
import { WeatherData } from '../types/plant';

interface PlantScannerProps {
  onScan: (imageBase64: string, previewUrl: string) => Promise<void>;
  isScanning: boolean;
  weather: WeatherData | null;
  language: 'gu' | 'en';
}

export const PlantScanner: React.FC<PlantScannerProps> = ({
  onScan,
  isScanning,
  weather,
  language,
}) => {
  const isGu = language === 'gu';
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setFacingMode(mode);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        isGu
          ? 'કેમેરા એક્સેસ મળી શક્યો નથી. કૃપા કરીને પરવાનગી આપો અથવા ફોટો અપલોડ કરો.'
          : 'Could not access camera. Please allow camera permissions or upload a photo instead.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    onScan(dataUrl, dataUrl);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCameraError(isGu ? 'કૃપા કરીને માત્ર ફોટો ફાઇલ (JPG, PNG, WEBP) પસંદ કરો.' : 'Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onScan(result, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = async (sample: SamplePlant) => {
    try {
      // Fetch sample image and convert to base64
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onScan(base64data, sample.imageUrl);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error('Failed to convert sample image:', e);
      // Fallback
      onScan(sample.imageUrl, sample.imageUrl);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/60 via-slate-900 to-slate-950 border border-emerald-800/40 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isGu ? 'AI છોડ ઓળખ + વાતાવરણ વિશ્લેષક' : 'AI Plant Identification & Climate Analysis'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            {isGu ? (
              <>
                છોડનો ફોટો સ્કેન કરો, <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 bg-clip-text text-transparent">
                  વાતાવરણ અને સંપૂર્ણ વિગતો મેળવો.
                </span>
              </>
            ) : (
              <>
                Scan Any Plant, <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 bg-clip-text text-transparent">
                  Get Climate & Botanical Insights.
                </span>
              </>
            )}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {isGu
              ? 'છોડનું નામ, આયુર્વેદિક ફાયદા, રોગ નિદાન ઉપરાંત તમારા શહેરના તાપમાન અને વાતાવરણ મુજબ અનુકૂળતા, પાણી-ખાતરની સંપૂર્ણ માર્ગદર્શિકા મેળવો.'
              : 'Discover botanical taxonomy, medicinal benefits, disease diagnosis, and whether your local temperature and humidity match this plant perfectly.'}
          </p>

          {/* Current Climate Context Pill */}
          {weather && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-200">
              <SunMedium className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400">{isGu ? 'હાલનું વાતાવરણ:' : 'Current Weather:'} </span>
                <span className="font-bold text-white">{weather.city}</span>
                <span className="mx-2 text-slate-600">|</span>
                <span className="font-semibold text-emerald-400">{weather.temperature}°C</span>
                <span className="mx-2 text-slate-600">|</span>
                <span className="font-semibold text-cyan-400">{weather.humidity}% {isGu ? 'ભેજ' : 'humidity'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Loading overlay during scan */}
        {isScanning ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-5 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isGu ? 'છોડ અને વાતાવરણનું વિશ્લેષણ ચાલુ છે...' : 'Analyzing Plant & Climate Compatibility...'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md">
                {isGu
                  ? 'AI મોડેલ પાંદડા, કળીઓ, આરોગ્ય અને તમારા વિસ્તારના હવામાનને ચકાસી રહ્યું છે...'
                  : 'AI is examining botanical traits, health status, and matching with local environmental conditions...'}
              </p>
            </div>
          </div>
        ) : cameraActive ? (
          /* Live Camera View */
          <div className="space-y-4">
            <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-black rounded-2xl overflow-hidden border border-emerald-500/40 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder reticle overlay */}
              <div className="absolute inset-8 border-2 border-emerald-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                </div>
                <div className="text-center text-xs text-emerald-300 font-medium bg-slate-950/60 px-3 py-1 rounded-full mx-auto backdrop-blur-sm">
                  {isGu ? 'છોડ અથવા પાંદડાને ફ્રેમમાં ગોઠવો' : 'Align plant or leaf inside frame'}
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>

              {/* Camera control buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleCameraFacing}
                  className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-sm"
                  title={isGu ? 'કેમેરો બદલો' : 'Flip Camera'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={stopCamera}
                  className="px-3 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold border border-slate-700 backdrop-blur-sm"
                >
                  {isGu ? 'રદ કરો' : 'Cancel'}
                </button>
              </div>
            </div>

            {/* Shutter Capture Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={capturePhoto}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-slate-950 group-hover:scale-110 transition-transform" />
                <span>{isGu ? 'ફોટો પાડો અને સ્કેન કરો' : 'Capture & Scan Plant'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Default Upload / Camera Launcher Options */
          <div className="space-y-6">
            {cameraError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Drag and Drop / Choose File Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-400 bg-emerald-950/20'
                  : 'border-slate-750 hover:border-emerald-500/60 bg-slate-850/50 hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    {isGu ? 'છોડનો ફોટો અહીં અપલોડ કરો' : 'Upload Plant Photo Here'}
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    {isGu
                      ? 'ફોટો પસંદ કરવા ક્લિક કરો અથવા ડ્રેગ એન્ડ ડ્રોપ કરો (JPG, PNG, WEBP)'
                      : 'Click to browse or drag & drop (JPG, PNG, WEBP)'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isGu ? 'લાઇવ કેમેરાથી સ્કેન કરો' : 'Open Camera'}</span>
                  </button>

                  <span className="text-xs text-slate-500 font-medium">
                    {isGu ? 'અથવા' : 'or'}
                  </span>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 text-xs sm:text-sm font-semibold transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{isGu ? 'ગેલેરીમાંથી પસંદ કરો' : 'Browse Gallery'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instant Test Sample Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{isGu ? 'તરત ટ્રાય કરવા માટે સેમ્પલ છોડ' : 'Instant Sample Plants for Testing'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isGu
                ? 'જો તમારી પાસે હાલમાં ફોટો ન હોય તો નીચેનામાંથી કોઈપણ એક છોડ પર ક્લિક કરો:'
                : 'Click any popular plant below to instantly run a full climate and botanical scan:'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SAMPLE_PLANTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSampleSelect(sample)}
              className="group relative bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-emerald-950/50"
            >
              <div className="aspect-square w-full overflow-hidden relative">
                <img
                  src={sample.imageUrl}
                  alt={sample.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                  {sample.category.split('/')[0]}
                </span>
              </div>

              <div className="p-3">
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {isGu ? sample.nameGu.split('(')[0] : sample.nameEn.split('(')[0]}
                </h4>
                <p className="text-[11px] text-slate-400 italic line-clamp-1">
                  {sample.scientificName}
                </p>
                <div className="mt-2 flex items-center text-[10px] font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>{isGu ? 'સ્કેન કરો' : 'Scan'}</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
