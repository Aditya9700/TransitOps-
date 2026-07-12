import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { PieChart } from 'lucide-react';

export const CostBreakdownBar: React.FC = () => {
  const { fuelLogs, expenses } = useExpenses();
  const { records: maintenanceRecords } = useMaintenance();

  const metrics = React.useMemo(() => {
    const fuelCost = fuelLogs.reduce((sum, l) => sum + l.fuelCost, 0);

    const tollCost = expenses
      .filter((e) => e.expenseCategory === 'Toll')
      .reduce((sum, e) => sum + e.amount, 0);

    const parkingCost = expenses
      .filter((e) => e.expenseCategory === 'Parking')
      .reduce((sum, e) => sum + e.amount, 0);

    const maintenanceCost = 
      expenses.filter((e) => e.expenseCategory === 'Maintenance').reduce((sum, e) => sum + e.amount, 0) +
      maintenanceRecords.filter((m) => m.status === 'Completed' || m.status === 'Active').reduce((sum, m) => sum + m.estimatedCost, 0);

    const otherCost = expenses
      .filter((e) => !['Toll', 'Parking', 'Maintenance'].includes(e.expenseCategory))
      .reduce((sum, e) => sum + e.amount, 0);

    const total = fuelCost + tollCost + parkingCost + maintenanceCost + otherCost;

    if (total === 0) {
      return {
        fuel: 0,
        maintenance: 0,
        tolls: 0,
        parking: 0,
        other: 0,
        total: 0,
      };
    }

    return {
      fuel: Math.round((fuelCost / total) * 100),
      maintenance: Math.round((maintenanceCost / total) * 100),
      tolls: Math.round((tollCost / total) * 100),
      parking: Math.round((parkingCost / total) * 100),
      other: Math.round((otherCost / total) * 100),
      total,
    };
  }, [fuelLogs, expenses, maintenanceRecords]);

  if (metrics.total === 0) return null;

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-slate-800">
          <PieChart className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Operational Cost Breakdown</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Horizontal Stacked bar */}
        <div className="flex h-6 w-full rounded-full overflow-hidden bg-slate-100 shadow-inner">
          {metrics.fuel > 0 && (
            <div 
              style={{ width: `${metrics.fuel}%` }} 
              className="bg-blue-500 hover:bg-blue-600 transition-colors"
              title={`Fuel: ${metrics.fuel}%`}
            />
          )}
          {metrics.maintenance > 0 && (
            <div 
              style={{ width: `${metrics.maintenance}%` }} 
              className="bg-amber-500 hover:bg-amber-600 transition-colors"
              title={`Maintenance: ${metrics.maintenance}%`}
            />
          )}
          {metrics.tolls > 0 && (
            <div 
              style={{ width: `${metrics.tolls}%` }} 
              className="bg-emerald-500 hover:bg-emerald-600 transition-colors"
              title={`Tolls: ${metrics.tolls}%`}
            />
          )}
          {metrics.parking > 0 && (
            <div 
              style={{ width: `${metrics.parking}%` }} 
              className="bg-purple-500 hover:bg-purple-600 transition-colors"
              title={`Parking: ${metrics.parking}%`}
            />
          )}
          {metrics.other > 0 && (
            <div 
              style={{ width: `${metrics.other}%` }} 
              className="bg-slate-400 hover:bg-slate-550 transition-colors"
              title={`Other: ${metrics.other}%`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs font-semibold text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
            <span>Fuel ({metrics.fuel}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
            <span>Service ({metrics.maintenance}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
            <span>Tolls ({metrics.tolls}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-purple-500 shrink-0" />
            <span>Parking ({metrics.parking}%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-slate-400 shrink-0" />
            <span>Other ({metrics.other}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
