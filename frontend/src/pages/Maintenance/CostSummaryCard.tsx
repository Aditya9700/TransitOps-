import React from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { CircleDollarSign, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export const CostSummaryCard: React.FC = () => {
  const { records } = useMaintenance();

  const totalCost = records.reduce((sum, r) => sum + r.estimatedCost, 0);
  const avgCost = records.length > 0 ? Math.round(totalCost / records.length) : 0;

  // Find highest cost service
  const highest = records.length > 0
    ? records.reduce((max, r) => (r.estimatedCost > max.estimatedCost ? r : max), records[0])
    : null;

  // Find most frequent service category
  const categoryCounts = records.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let mostFrequent = 'None';
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = cat;
    }
  });

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-slate-800">
          <CircleDollarSign className="h-4.5 w-4.5 text-primary" />
          <span>Maintenance Cost Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 font-medium text-xs text-slate-600">
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Average Repair Cost</span>
          </div>
          <span className="text-sm font-bold text-slate-900">₹{avgCost.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
            <span>Highest Cost Service</span>
          </div>
          <div className="text-right">
            <span className="text-slate-800 block font-bold leading-none mb-1">
              ₹{highest ? highest.estimatedCost.toLocaleString() : 0}
            </span>
            <span className="text-[10px] text-slate-400 block max-w-[150px] truncate leading-none">
              {highest ? highest.serviceType : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-blue-500 shrink-0" />
            <span>Most Frequent Service</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 block leading-none mb-1">{mostFrequent}</span>
            <span className="text-[10px] text-slate-400 block leading-none">({maxCount} logs registered)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
