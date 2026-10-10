import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Ruler,
  Leaf,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SavedPlant, GrowthLogEntry } from '../types/plant';

interface PlantGrowthTrackerModalProps {
  plant: SavedPlant;
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (plantId: string, entry: Omit<GrowthLogEntry, 'id'>) => void;
  onDeleteLog: (plantId: string, logId: string) => void;
  language: 'gu' | 'en';
}

export const PlantGrowthTrackerModal: React.FC<PlantGrowthTrackerModalProps> = ({
  plant,
  isOpen,
  onClose,
  onAddLog,
  onDeleteLog,
  language,
}) => {
  const isGu = language === 'gu';

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [heightCm, setHeightCm] = useState<string>('');
  const [leafCount, setLeafCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'both' | 'height' | 'leaves'>('both');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Sorted logs by date ascending
  const sortedLogs = useMemo(() => {
    const logs = plant.growthLogs ? [...plant.growthLogs] : [];
    return logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [plant.growthLogs]);

  // Derived stats
  const stats = useMemo(() => {
    if (sortedLogs.length === 0) {
      return {
        latestHeight: null,
        latestLeaves: null,
        heightGrowth: 0,
        leafGrowth: 0,
        totalEntries: 0,
      };
    }

    const firstWithHeight = sortedLogs.find((l) => l.heightCm !== undefined && l.heightCm !== null);
    const lastWithHeight = [...sortedLogs].reverse().find((l) => l.heightCm !== undefined && l.heightCm !== null);

    const firstWithLeaves = sortedLogs.find((l) => l.leafCount !== undefined && l.leafCount !== null);
    const lastWithLeaves = [...sortedLogs].reverse().find((l) => l.leafCount !== undefined && l.leafCount !== null);

    const latestHeight = lastWithHeight?.heightCm ?? null;
    const latestLeaves = lastWithLeaves?.leafCount ?? null;

    const heightGrowth =
      firstWithHeight && lastWithHeight && firstWithHeight.id !== lastWithHeight.id
        ? (lastWithHeight.heightCm ?? 0) - (firstWithHeight.heightCm ?? 0)
        : 0;

    const leafGrowth =
      firstWithLeaves && lastWithLeaves && firstWithLeaves.id !== lastWithLeaves.id
        ? (lastWithLeaves.leafCount ?? 0) - (firstWithLeaves.leafCount ?? 0)
        : 0;

    return {
      latestHeight,
      latestLeaves,
      heightGrowth,
      leafGrowth,
      totalEntries: sortedLogs.length,
    };
  }, [sortedLogs]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = heightCm.trim() ? parseFloat(heightCm) : undefined;
    const l = leafCount.trim() ? parseInt(leafCount, 10) : undefined;

    if (h === undefined && l === undefined) {
      setFormError(
        isGu
          ? 'કૃપા કરીને ઊંચાઈ (cm) અથવા પાંદડાની સંખ્યામાંથી ઓછામાં ઓછું એક મૂલ્ય દાખલ કરો.'
          : 'Please enter at least Height (cm) or Leaf Count.'
      );
      return;
    }

    setFormError(null);

    onAddLog(plant.id, {
      date,
      heightCm: h,
      leafCount: l,
      notes: notes.trim() || undefined,
    });

    // Reset inputs
    setHeightCm('');
    setLeafCount('');
    setNotes('');
  };

  const handleAddSampleLogs = () => {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() - 21);
    const d2 = new Date(today);
    d2.setDate(today.getDate() - 14);
    const d3 = new Date(today);
    d3.setDate(today.getDate() - 7);
    const d4 = new Date(today);

    onAddLog(plant.id, {
      date: d1.toISOString().split('T')[0],
      heightCm: 15,
      leafCount: 8,
      notes: isGu ? 'પ્રથમ માપણી / કૂંડામાં રોપણી' : 'Initial measurement after potting',
    });
    onAddLog(plant.id, {
      date: d2.toISOString().split('T')[0],
      heightCm: 17.5,
      leafCount: 11,
      notes: isGu ? 'વર્મીકમ્પોસ્ટ ખાતર આપ્યું' : 'Added organic vermicompost',
    });
    onAddLog(plant.id, {
      date: d3.toISOString().split('T')[0],
      heightCm: 20,
      leafCount: 15,
      notes: isGu ? 'નવી કૂંપળો અને તાજા પાન આવ્યા' : 'Healthy new shoots emerging',
    });
    onAddLog(plant.id, {
      date: d4.toISOString().split('T')[0],
      heightCm: 23,
      leafCount: 19,
      notes: isGu ? 'ઝડપી વિકાસ અને સ્વસ્થ લીલા પાંદડા' : 'Steady vigorous development',
    });
  };

  // SVG Chart Geometry Calculations
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Max values for scale
  const validHeights = sortedLogs.filter((l) => l.heightCm !== undefined).map((l) => l.heightCm as number);
  const validLeaves = sortedLogs.filter((l) => l.leafCount !== undefined).map((l) => l.leafCount as number);

  const minHeight = validHeights.length > 0 ? Math.min(0, Math.min(...validHeights)) : 0;
  const maxHeight = validHeights.length > 0 ? Math.max(...validHeights) * 1.15 : 30;

  const minLeaves = validLeaves.length > 0 ? Math.min(0, Math.min(...validLeaves)) : 0;
  const maxLeaves = validLeaves.length > 0 ? Math.max(...validLeaves) * 1.2 : 25;

  // Coordinates helper
  const getX = (index: number) => {
    if (sortedLogs.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (sortedLogs.length - 1)) * innerWidth;
  };

  const getYHeight = (val: number) => {
    if (maxHeight === minHeight) return paddingTop + innerHeight / 2;
    const ratio = (val - minHeight) / (maxHeight - minHeight);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const getYLeaves = (val: number) => {
    if (maxLeaves === minLeaves) return paddingTop + innerHeight / 2;
    const ratio = (val - minLeaves) / (maxLeaves - minLeaves);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  // Height SVG Path
  const heightPoints = sortedLogs
    .map((l, i) => (l.heightCm !== undefined ? { x: getX(i), y: getYHeight(l.heightCm), val: l.heightCm, log: l, index: i } : null))
    .filter(Boolean) as Array<{ x: number; y: number; val: number; log: GrowthLogEntry; index: number }>;

  const heightPath =
    heightPoints.length > 1
      ? heightPoints.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')
      : '';

  const heightAreaPath =
    heightPoints.length > 1
      ? `${heightPath} L ${heightPoints[heightPoints.length - 1].x} ${paddingTop + innerHeight} L ${heightPoints[0].x} ${paddingTop + innerHeight} Z`
      : '';

  // Leaves SVG Path
  const leavesPoints = sortedLogs
    .map((l, i) => (l.leafCount !== undefined ? { x: getX(i), y: getYLeaves(l.leafCount), val: l.leafCount, log: l, index: i } : null))
    .filter(Boolean) as Array<{ x: number; y: number; val: number; log: GrowthLogEntry; index: number }>;

  const leavesPath =
    leavesPoints.length > 1
      ? leavesPoints.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')
      : '';

  const leavesAreaPath =
    leavesPoints.length > 1
      ? `${leavesPath} L ${leavesPoints[leavesPoints.length - 1].x} ${paddingTop + innerHeight} L ${leavesPoints[0].x} ${paddingTop + innerHeight} Z`
      : '';

  const hoveredLog = hoveredPointIndex !== null ? sortedLogs[hoveredPointIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={plant.imageUrl}
              alt={plant.plantData.plantName.commonEnglish}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {plant.plantData.plantName.gujaratiName}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {isGu ? 'વૃદ્ધિ અને ગ્રોથ ટ્રેકર' : 'Growth Tracker'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {plant.plantData.plantName.commonEnglish} •{' '}
                <span className="italic">{plant.plantData.plantName.scientificName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Quick Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Height Card */}
            <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  {isGu ? 'હાલની ઊંચાઈ' : 'Current Height'}
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {stats.latestHeight !== null ? `${stats.latestHeight} cm` : '—'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                {stats.heightGrowth > 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center">
                    <ArrowUpRight className="w-3 h-3" /> +{stats.heightGrowth} cm
                  </span>
                ) : (
                  <span>{isGu ? 'પ્રારંભિક સ્થિતિ' : 'Baseline'}</span>
                )}
              </div>
            </div>

            {/* Leaves Card */}
            <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-teal-400 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  {isGu ? 'પાંદડાની સંખ્યા' : 'Leaf Count'}
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {stats.latestLeaves !== null ? `${stats.latestLeaves}` : '—'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                {stats.leafGrowth > 0 ? (
                  <span className="text-teal-400 font-medium flex items-center">
                    <ArrowUpRight className="w-3 h-3" /> +{stats.leafGrowth}{' '}
                    {isGu ? 'નવા પાન' : 'new leaves'}
                  </span>
                ) : (
                  <span>{isGu ? 'પ્રારંભિક સંખ્યા' : 'Initial count'}</span>
                )}
              </div>
            </div>

            {/* Total Recorded Checks */}
            <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {isGu ? 'કુલ લોગ એન્ટ્રી' : 'Total Logs'}
                </span>
              </div>
              <div className="text-xl font-bold text-white">{stats.totalEntries}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isGu ? 'સમય સાથે માપણી' : 'Tracked entries'}
              </div>
            </div>

            {/* Last Logged Date */}
            <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {isGu ? 'છેલ્લી ચકાસણી' : 'Last Log'}
                </span>
              </div>
              <div className="text-sm font-bold text-white truncate mt-1">
                {sortedLogs.length > 0
                  ? new Date(sortedLogs[sortedLogs.length - 1].date).toLocaleDateString(
                      isGu ? 'gu-IN' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )
                  : '—'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isGu ? 'નિયમિત નોંધણી' : 'Periodic record'}
              </div>
            </div>
          </div>

          {/* Visualization Section with SVG Chart */}
          <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{isGu ? 'સમય અનુસાર છોડનો વિકાસ ચાર્ટ' : 'Growth Over Time Chart'}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  {isGu
                    ? 'ઊંચાઈ (સેમી) અને પાંદડાઓની સંખ્યામાં થયેલો વધારો'
                    : 'Visualizing height and leaf count progression over time'}
                </p>
              </div>

              {/* Metric View Filters */}
              {sortedLogs.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs">
                  <button
                    onClick={() => setActiveMetric('both')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeMetric === 'both'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isGu ? 'બંને (Both)' : 'Both'}
                  </button>
                  <button
                    onClick={() => setActiveMetric('height')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      activeMetric === 'height'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{isGu ? 'ઊંચાઈ (cm)' : 'Height'}</span>
                  </button>
                  <button
                    onClick={() => setActiveMetric('leaves')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                      activeMetric === 'leaves'
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <span>{isGu ? 'પાંદડા' : 'Leaves'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Chart Area */}
            {sortedLogs.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl bg-slate-900/60 border border-dashed border-slate-750 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {isGu ? 'હજુ સુધી કોઈ વૃદ્ધિ નોંધાઈ નથી' : 'No growth measurements logged yet'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {isGu
                      ? 'નીચેના ફોર્મમાંથી ઊંચાઈ અથવા પાંદડાની સંખ્યા ઉમેરો, અથવા ડેમો જોવા માટે સેમ્પલ ડેટા લોડ કરો.'
                      : 'Log height or leaf count below, or click demo to preview development curve.'}
                  </p>
                </div>
                <button
                  onClick={handleAddSampleLogs}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGu ? 'ડેમો ગ્રોથ ડેટા લોડ કરો (Demo Logs)' : 'Load Demo Growth Data'}</span>
                </button>
              </div>
            ) : (
              <div className="relative bg-slate-900 rounded-2xl p-3 border border-slate-800 overflow-hidden">
                {/* SVG Chart */}
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto min-w-[500px] select-none"
                  >
                    <defs>
                      {/* Gradient for Height Area */}
                      <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Gradient for Leaves Area */}
                      <linearGradient id="leavesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                      const y = paddingTop + innerHeight * pct;
                      const hVal = Math.round(maxHeight - pct * (maxHeight - minHeight));
                      const lVal = Math.round(maxLeaves - pct * (maxLeaves - minLeaves));
                      return (
                        <g key={i}>
                          <line
                            x1={paddingLeft}
                            y1={y}
                            x2={chartWidth - paddingRight}
                            y2={y}
                            stroke="#334155"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                            opacity="0.5"
                          />
                          {/* Left Y Axis Label (Height) */}
                          {(activeMetric === 'both' || activeMetric === 'height') && (
                            <text
                              x={paddingLeft - 8}
                              y={y + 3}
                              fill="#10b981"
                              fontSize="10"
                              textAnchor="end"
                              fontWeight="bold"
                            >
                              {hVal}
                            </text>
                          )}
                          {/* Right Y Axis Label (Leaves) */}
                          {(activeMetric === 'both' || activeMetric === 'leaves') && (
                            <text
                              x={chartWidth - paddingRight + 8}
                              y={y + 3}
                              fill="#14b8a6"
                              fontSize="10"
                              textAnchor="start"
                              fontWeight="bold"
                            >
                              {lVal}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Left Axis Title */}
                    {(activeMetric === 'both' || activeMetric === 'height') && (
                      <text
                        x={paddingLeft - 8}
                        y={paddingTop - 10}
                        fill="#10b981"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        cm
                      </text>
                    )}

                    {/* Right Axis Title */}
                    {(activeMetric === 'both' || activeMetric === 'leaves') && (
                      <text
                        x={chartWidth - paddingRight + 8}
                        y={paddingTop - 10}
                        fill="#14b8a6"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="start"
                      >
                        {isGu ? 'પાન' : 'leaves'}
                      </text>
                    )}

                    {/* Height Area & Line */}
                    {(activeMetric === 'both' || activeMetric === 'height') && heightPath && (
                      <>
                        <path d={heightAreaPath} fill="url(#heightGrad)" />
                        <path
                          d={heightPath}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}

                    {/* Leaves Area & Line */}
                    {(activeMetric === 'both' || activeMetric === 'leaves') && leavesPath && (
                      <>
                        <path d={leavesAreaPath} fill="url(#leavesGrad)" />
                        <path
                          d={leavesPath}
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="2.5"
                          strokeDasharray={activeMetric === 'both' ? '6 4' : 'none'}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}

                    {/* Height Dots */}
                    {(activeMetric === 'both' || activeMetric === 'height') &&
                      heightPoints.map((pt, i) => (
                        <circle
                          key={`h-${i}`}
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredPointIndex === pt.index ? 6 : 4}
                          fill="#10b981"
                          stroke="#0f172a"
                          strokeWidth="2"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPointIndex(pt.index)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        />
                      ))}

                    {/* Leaves Dots */}
                    {(activeMetric === 'both' || activeMetric === 'leaves') &&
                      leavesPoints.map((pt, i) => (
                        <circle
                          key={`l-${i}`}
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredPointIndex === pt.index ? 6 : 3.5}
                          fill="#14b8a6"
                          stroke="#0f172a"
                          strokeWidth="2"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPointIndex(pt.index)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        />
                      ))}

                    {/* X-axis Date Labels */}
                    {sortedLogs.map((log, i) => {
                      const x = getX(i);
                      const dateLabel = new Date(log.date).toLocaleDateString(
                        isGu ? 'gu-IN' : 'en-US',
                        { month: 'numeric', day: 'numeric' }
                      );
                      return (
                        <text
                          key={log.id}
                          x={x}
                          y={chartHeight - 12}
                          fill={hoveredPointIndex === i ? '#ffffff' : '#94a3b8'}
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight={hoveredPointIndex === i ? 'bold' : 'normal'}
                        >
                          {dateLabel}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend & Hovered Tooltip */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-4">
                    {(activeMetric === 'both' || activeMetric === 'height') && (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                        <span>{isGu ? 'ઊંચાઈ (Height cm)' : 'Height (cm)'}</span>
                      </div>
                    )}
                    {(activeMetric === 'both' || activeMetric === 'leaves') && (
                      <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                        <span className="w-3 h-1 bg-teal-400 rounded-full" />
                        <span>{isGu ? 'પાંદડા (Leaf Count)' : 'Leaf Count'}</span>
                      </div>
                    )}
                  </div>

                  {hoveredLog ? (
                    <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-xs text-white">
                      <span className="font-bold text-slate-300">
                        {new Date(hoveredLog.date).toLocaleDateString()}:{' '}
                      </span>
                      {hoveredLog.heightCm !== undefined && (
                        <span className="text-emerald-400 font-bold ml-1">
                          {hoveredLog.heightCm} cm
                        </span>
                      )}
                      {hoveredLog.leafCount !== undefined && (
                        <span className="text-teal-400 font-bold ml-2">
                          {hoveredLog.leafCount} {isGu ? 'પાન' : 'leaves'}
                        </span>
                      )}
                      {hoveredLog.notes && (
                        <span className="text-slate-400 ml-2 italic">"{hoveredLog.notes}"</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {isGu ? 'ચાર્ટ પર પોઈન્ટ પર કર્સર લાવો' : 'Hover over chart points to view details'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form to Log New Measurement */}
          <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{isGu ? 'નવી વૃદ્ધિ નોંધ ઉમેરો' : 'Log New Growth Measurement'}</span>
            </h4>

            {formError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Date */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  {isGu ? 'તારીખ (Date)' : 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Height (cm) */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {isGu ? 'ઊંચાઈ (સેમી - cm)' : 'Height (cm)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="500"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder={isGu ? 'દા.ત. 18.5' : 'e.g. 18.5'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Leaf Count */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-teal-400 mb-1 flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  {isGu ? 'પાંદડાની સંખ્યા' : 'Leaf Count'}
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="1000"
                  value={leafCount}
                  onChange={(e) => setLeafCount(e.target.value)}
                  placeholder={isGu ? 'દા.ત. 14' : 'e.g. 14'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Notes & Submit */}
              <div className="sm:col-span-4 flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                    {isGu ? 'અવલોકન / નોંધ (વૈકલ્પિક)' : 'Observation Note (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      isGu
                        ? 'દા.ત. નવી કૂંપળ આવી, ટોચની છાંટણી કરી, ખાતર આપ્યું...'
                        : 'e.g. New shoot emerged, pruned tips, added compost...'
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isGu ? 'માપણી સાચવો' : 'Save Measurement'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Log History Timeline Table */}
          {sortedLogs.length > 0 && (
            <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm sm:text-base text-white">
                {isGu ? 'નોંધણી ઇતિહાસ (Measurement History)' : 'Measurement History'}
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5 rounded-l-xl">{isGu ? 'તારીખ' : 'Date'}</th>
                      <th className="px-3.5 py-2.5">{isGu ? 'ઊંચાઈ (cm)' : 'Height'}</th>
                      <th className="px-3.5 py-2.5">{isGu ? 'પાંદડા' : 'Leaves'}</th>
                      <th className="px-3.5 py-2.5">{isGu ? 'નોંધ / અવલોકન' : 'Observation'}</th>
                      <th className="px-3.5 py-2.5 text-right rounded-r-xl">{isGu ? 'ક્રિયા' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[...sortedLogs].reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-3.5 py-2.5 font-medium text-white">
                          {new Date(log.date).toLocaleDateString(isGu ? 'gu-IN' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-3.5 py-2.5 font-semibold text-emerald-400">
                          {log.heightCm !== undefined ? `${log.heightCm} cm` : '—'}
                        </td>
                        <td className="px-3.5 py-2.5 font-semibold text-teal-400">
                          {log.leafCount !== undefined ? `${log.leafCount}` : '—'}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-300">
                          {log.notes ? <span>📝 {log.notes}</span> : <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <button
                            onClick={() => onDeleteLog(plant.id, log.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                            title={isGu ? 'ડીલીટ કરો' : 'Delete entry'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {isGu ? 'બંધ કરો' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
