import React from 'react';
import { type Vehicle } from '../../context/FleetContext';
import { type FuelLog, type Expense } from '../../context/ExpenseContext';
import { type MaintenanceRecord } from '../../context/MaintenanceContext';
import { type Trip } from '../../context/TripContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { TrendingUp, Flame } from 'lucide-react';

interface LeaderboardCardProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceRecords: MaintenanceRecord[];
  trips: Trip[];
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  vehicles,
  fuelLogs,
  expenses,
  maintenanceRecords,
  trips,
}) => {
  // Compute rankings data
  const vehicleMetricsList = React.useMemo(() => {
    return vehicles
      .map((vehicle) => {
        const vFuel = fuelLogs.filter((l) => l.vehicleId === vehicle.id);
        const vExp = expenses.filter((e) => e.vehicleId === vehicle.id);
        const vMnt = maintenanceRecords.filter(
          (m) => m.vehicleId === vehicle.id && (m.status === 'Completed' || m.status === 'Active')
        );
        const vTrips = trips.filter(
          (t) => t.vehicleId === vehicle.id && (t.status === 'Completed' || t.status === 'Dispatched')
        );

        const fuelCost = vFuel.reduce((sum, l) => sum + l.fuelCost, 0);
        const fuelQty = vFuel.reduce((sum, l) => sum + l.fuelQuantity, 0);
        const expenseCost = vExp.reduce((sum, e) => sum + e.amount, 0);
        const maintenanceCost = vMnt.reduce((sum, m) => sum + m.estimatedCost, 0);

        const operationalCost = fuelCost + expenseCost + maintenanceCost;
        
        const tripsCount = vTrips.length;
        const totalDistance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
        const efficiency = fuelQty > 0 ? totalDistance / fuelQty : 0;

        const revenue = vTrips.reduce((sum, t) => sum + t.expectedRevenue, 0);
        
        // Acquisition cost from vehicle cost (fallback to 800000 if not set)
        const acquisitionCost = vehicle.acquisitionCost || 800000;
        const roi = ((revenue - operationalCost) / acquisitionCost) * 100;

        return {
          id: vehicle.id,
          name: vehicle.name,
          reg: vehicle.registrationNumber,
          trips: tripsCount,
          revenue,
          efficiency,
          roi,
          operationalCost,
          fuelCost,
          maintenanceCost,
          otherCost: expenseCost,
        };
      });
  }, [vehicles, fuelLogs, expenses, maintenanceRecords, trips]);

  // Rankings sorted by ROI descending
  const topROI = React.useMemo(() => {
    return [...vehicleMetricsList].sort((a, b) => b.roi - a.roi).slice(0, 5);
  }, [vehicleMetricsList]);

  // Most Expensive sorted by Operational Cost descending
  const topExpenses = React.useMemo(() => {
    return [...vehicleMetricsList].sort((a, b) => b.operationalCost - a.operationalCost).slice(0, 5);
  }, [vehicleMetricsList]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
      {/* 1. Leaderboard Table */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
          <TrendingUp className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <CardTitle className="text-sm font-bold text-slate-900">Top Performing Vehicles (ROI)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Vehicle</TableHead>
                <TableHead>Trips</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead className="pr-6 text-right">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topROI.map((v, idx) => (
                <TableRow key={v.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 py-3 font-semibold">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                        {idx + 1}. {v.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono leading-none">{v.reg}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-655 text-xs font-semibold">{v.trips}</TableCell>
                  <TableCell className="text-slate-800 text-xs font-bold">₹{v.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-slate-655 text-xs font-semibold">{v.efficiency.toFixed(2)} km/L</TableCell>
                  <TableCell className="pr-6 text-right text-xs font-bold text-emerald-600">
                    {v.roi.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 2. Most Expensive Progress Bars */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
          <Flame className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <CardTitle className="text-sm font-bold text-slate-900">Highest Cost Vehicles</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {topExpenses.map((v) => {
            const maxCost = Math.max(...topExpenses.map((x) => x.operationalCost), 1);
            const pct = (v.operationalCost / maxCost) * 100;
            return (
              <div key={v.id} className="space-y-1.5 font-semibold text-xs text-slate-700">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-slate-950 font-bold">{v.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">({v.reg})</span>
                  </div>
                  <span className="text-slate-900 font-bold">₹{v.operationalCost.toLocaleString()}</span>
                </div>
                
                {/* Cost bar stack */}
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  {v.fuelCost > 0 && (
                    <div 
                      style={{ width: `${(v.fuelCost / v.operationalCost) * pct}%` }}
                      className="bg-blue-500 hover:bg-blue-600 transition-colors"
                      title={`Fuel Cost: ₹${v.fuelCost.toLocaleString()}`}
                    />
                  )}
                  {v.maintenanceCost > 0 && (
                    <div 
                      style={{ width: `${(v.maintenanceCost / v.operationalCost) * pct}%` }}
                      className="bg-amber-500 hover:bg-amber-600 transition-colors"
                      title={`Maintenance: ₹${v.maintenanceCost.toLocaleString()}`}
                    />
                  )}
                  {v.otherCost > 0 && (
                    <div 
                      style={{ width: `${(v.otherCost / v.operationalCost) * pct}%` }}
                      className="bg-slate-400 hover:bg-slate-500 transition-colors"
                      title={`Other Expenses: ₹${v.otherCost.toLocaleString()}`}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                  <span>Fuel: ₹{v.fuelCost.toLocaleString()}</span>
                  <span>Servicing: ₹{v.maintenanceCost.toLocaleString()}</span>
                  <span>Tolls/Misc: ₹{v.otherCost.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
