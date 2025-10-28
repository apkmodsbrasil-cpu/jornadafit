import React, { useMemo, useState } from 'react';
import type { PerformanceHistoryEntry } from '../types.ts';

interface PerformanceChartProps {
  title: string;
  data: PerformanceHistoryEntry[];
  color: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ title, data, color }) => {
// FIX: Changed the tooltip state to expect a Date object for the date property. This aligns the tooltip data with the chart's internal data structure, resolving type errors when setting the tooltip and formatting the date for display.
  const [tooltip, setTooltip] = useState<{ x: number; y: number; entry: { date: Date; weight: number; reps: number; } } | null>(null);
  
  const width = 400;
  const height = 200;
  const padding = 35;

  const chartData = useMemo(() => {
    return data
      .map(entry => ({...entry, date: new Date(entry.date)}))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  const minWeight = useMemo(() => {
      if (chartData.length === 0) return 0;
      return Math.max(0, Math.floor(Math.min(...chartData.map(d => d.weight)) / 5) * 5 - 5);
  }, [chartData]);
  const maxWeight = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.ceil(Math.max(...chartData.map(d => d.weight)) / 5) * 5 + 5
  }, [chartData]);
  
  const startDate = useMemo(() => chartData[0]?.date.getTime(), [chartData]);
  const endDate = useMemo(() => chartData[chartData.length - 1]?.date.getTime(), [chartData]);

  if (chartData.length < 2) {
    return (
      <div>
        <h4 className="font-semibold text-gray-200 mb-1">{title}</h4>
        <div className="h-[200px] flex items-center justify-center bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-500">Dados insuficientes para gerar gráfico.</p>
        </div>
      </div>
    );
  }

  const xScale = (date: Date) => {
    if (!startDate || !endDate || startDate === endDate) return padding;
    return padding + ((date.getTime() - startDate) / (endDate - startDate)) * (width - padding * 2);
  };

  const yScale = (weight: number) => {
    if (maxWeight <= minWeight) return height - padding;
    return height - padding - ((weight - minWeight) / (maxWeight - minWeight)) * (height - padding * 2);
  };

  const linePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.date)} ${yScale(d.weight)}`).join(' ');

  const formatDate = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div>
      <h4 className="font-semibold text-gray-200 mb-2 text-center text-lg">{title}</h4>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-gray-800/50 rounded-lg">
          {/* Y Axis Grid Lines & Labels */}
          {[...Array(5)].map((_, i) => {
            const y = padding + i * ((height - 2 * padding) / 4);
            const value = maxWeight - i * ((maxWeight - minWeight) / 4);
            if (value < 0) return null;
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(75, 85, 99, 0.5)" strokeWidth="0.5" strokeDasharray="3,3" />
                <text x={padding - 8} y={y + 4} fill="#9CA3AF" fontSize="10" textAnchor="end">{value.toFixed(0)}kg</text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          <text x={padding} y={height - padding + 15} fill="#9CA3AF" fontSize="10" textAnchor="start">{formatDate(chartData[0].date)}</text>
          <text x={width - padding} y={height - padding + 15} fill="#9CA3AF" fontSize="10" textAnchor="end">{formatDate(chartData[chartData.length - 1].date)}</text>
          
          <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {chartData.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.date)}
              cy={yScale(d.weight)}
              r="4"
              fill={color}
              stroke="#111827"
              strokeWidth="2"
              onMouseEnter={() => setTooltip({ x: xScale(d.date), y: yScale(d.weight), entry: d })}
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            />
          ))}
        </svg>
        
        {tooltip && (
          <div
            className="absolute bg-gray-950 text-white text-xs rounded-md p-2 shadow-lg pointer-events-none transition-opacity border border-gray-700"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: `translate(calc(-50% + 0px), calc(-100% - 10px))`,
              opacity: 1,
            }}
          >
            <div className="font-bold">{formatDate(tooltip.entry.date)}</div>
            <div>{tooltip.entry.weight}kg x {tooltip.entry.reps} reps</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;
