import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  isPositive: boolean;
  sparklineData?: number[];
  formulaDescription?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  isPositive,
  sparklineData = [10, 15, 8, 14, 18, 12, 20],
  formulaDescription,
}) => {
  // Convert sparkline numerical list to SVG polyline coordinates
  const sparkPoints = React.useMemo(() => {
    const width = 80;
    const height = 24;
    const maxVal = Math.max(...sparklineData, 1);
    const minVal = Math.min(...sparklineData, 0);
    const range = maxVal - minVal;
    
    return sparklineData
      .map((val, idx) => {
        const x = (idx / (sparklineData.length - 1)) * width;
        const y = height - ((val - minVal) / range) * height + 2; // offset to avoid cuts
        return `${x},${y}`;
      })
      .join(' ');
  }, [sparklineData]);

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block max-w-[85%] truncate">
          {title}
        </span>
        {formulaDescription && (
          <div className="relative group shrink-0">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full h-4.5 w-4.5 flex items-center justify-center cursor-pointer select-none">
              ?
            </span>
            <div className="absolute right-0 bottom-6 hidden group-hover:block bg-slate-900 text-white text-[10px] font-medium p-2 rounded-lg w-52 shadow-lg z-50 leading-relaxed">
              {formulaDescription}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold tracking-tight text-slate-950">
            {value}
          </span>

          {/* Sparkline mini chart */}
          <svg className="h-6 w-20 shrink-0" viewBox="0 0 80 28">
            <polyline
              fill="none"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="1.8"
              points={sparkPoints}
            />
          </svg>
        </div>

        {/* Trend marker */}
        <div className="flex items-center space-x-1 text-xs">
          <span className={`inline-flex items-center font-bold ${
            isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5 shrink-0" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5 shrink-0" />
            )}
            {trend}
          </span>
          <span className="text-slate-400 font-medium">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
};
