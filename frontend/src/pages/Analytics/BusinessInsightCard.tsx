import React from 'react';
import { type Vehicle } from '../../context/FleetContext';
import { type Driver } from '../../context/DriverContext';
import { type FuelLog, type Expense } from '../../context/ExpenseContext';
import { type MaintenanceRecord } from '../../context/MaintenanceContext';
import { type Trip } from '../../context/TripContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Calculator, Award, ZapOff, Sparkles, Navigation, Fuel } from 'lucide-react';

interface BusinessInsightCardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceRecords: MaintenanceRecord[];
  trips: Trip[];
}

export const BusinessInsightCard: React.FC<BusinessInsightCardProps> = ({
  vehicles,
  drivers,
  fuelLogs,
  expenses,
  maintenanceRecords,
  trips,
}) => {
  const highlights = React.useMemo(() => {
    // 1. Calculations arrays per vehicle
    const metrics = vehicles.map((vehicle) => {
      const vFuel = fuelLogs.filter((l) => l.vehicleId === vehicle.id);
      const vExp = expenses.filter((e) => e.vehicleId === vehicle.id);
      const vMnt = maintenanceRecords.filter(
        (m) => m.vehicleId === vehicle.id && (m.status === 'Completed' || m.status === 'Active')
      );
      const vTrips = trips.filter((t) => t.vehicleId === vehicle.id && t.status === 'Completed');

      const fuelCost = vFuel.reduce((sum, l) => sum + l.fuelCost, 0);
      const fuelQty = vFuel.reduce((sum, l) => sum + l.fuelQuantity, 0);
      const expenseCost = vExp.reduce((sum, e) => sum + e.amount, 0);
      const maintenanceCost = vMnt.reduce((sum, m) => sum + m.estimatedCost, 0);

      const runningCost = fuelCost + expenseCost + maintenanceCost;
      const totalDistance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
      const efficiency = fuelQty > 0 ? totalDistance / fuelQty : 0;
      const revenue = vTrips.reduce((sum, t) => sum + t.expectedRevenue, 0);
      const profit = revenue - runningCost;

      return {
        id: vehicle.id,
        name: vehicle.name,
        reg: vehicle.registrationNumber,
        fuelQty,
        runningCost,
        efficiency,
        maintenanceCost,
        profit,
      };
    });

    // most profitable
    const mostProfitable = metrics.length > 0 
      ? metrics.reduce((max, x) => (x.profit > max.profit ? x : max), metrics[0]) 
      : { name: 'None', reg: '', profit: 0 };

    // highest maintenance
    const highestMaintenance = metrics.length > 0 
      ? metrics.reduce((max, x) => (x.runningCost > max.runningCost ? x : max), metrics[0]) 
      : { name: 'None', reg: '', runningCost: 0 };

    // highest consumer
    const highestConsumer = metrics.length > 0 
      ? metrics.reduce((max, x) => (x.fuelQty > max.fuelQty ? x : max), metrics[0]) 
      : { name: 'None', reg: '', fuelQty: 0 };

    // lowest efficiency
    const validEfficiencies = metrics.filter((x) => x.efficiency > 0);
    const lowestEfficiency = validEfficiencies.length > 0 
      ? validEfficiencies.reduce((min, x) => (x.efficiency < min.efficiency ? x : min), validEfficiencies[0]) 
      : { name: 'None', reg: '', efficiency: 0 };

    // 2. Most Active Driver
    const driverMetrics = drivers.map((d) => {
      const runs = trips.filter((t) => t.driverId === d.id && t.status === 'Completed').length;
      return { id: d.id, name: d.name, count: runs };
    });
    const mostActiveDriver = driverMetrics.length > 0 
      ? driverMetrics.reduce((max, x) => (x.count > max.count ? x : max), driverMetrics[0]) 
      : { name: 'None', count: 0 };

    // 3. Highest Revenue Route
    const routeRevenue: Record<string, number> = {};
    trips
      .filter((t) => t.status === 'Completed')
      .forEach((t) => {
        const key = `${t.source} ➔ ${t.destination}`;
        routeRevenue[key] = (routeRevenue[key] || 0) + t.expectedRevenue;
      });

    let topRoute = 'No active dispatches';
    let topRevenue = 0;
    Object.entries(routeRevenue).forEach(([route, val]) => {
      if (val > topRevenue) {
        topRevenue = val;
        topRoute = route;
      }
    });

    return {
      mostProfitable,
      highestMaintenance,
      highestConsumer,
      lowestEfficiency,
      mostActiveDriver,
      topRoute,
      topRevenue,
    };
  }, [vehicles, drivers, fuelLogs, expenses, maintenanceRecords, trips]);

  const rows = [
    {
      label: 'Most Profitable Vehicle',
      value: `${highlights.mostProfitable.name} (${highlights.mostProfitable.reg})`,
      detail: `₹${highlights.mostProfitable.profit.toLocaleString()} net profit`,
      icon: Sparkles,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      label: 'Highest Fuel Consumer',
      value: `${highlights.highestConsumer.name} (${highlights.highestConsumer.reg})`,
      detail: `${highlights.highestConsumer.fuelQty.toLocaleString()} L consumed`,
      icon: Fuel,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'Lowest Fuel Efficiency',
      value: `${highlights.lowestEfficiency.name} (${highlights.lowestEfficiency.reg})`,
      detail: `${highlights.lowestEfficiency.efficiency.toFixed(2)} km/L avg`,
      icon: ZapOff,
      color: 'text-red-500 bg-red-50',
    },
    {
      label: 'Most Active Driver',
      value: highlights.mostActiveDriver.name,
      detail: `${highlights.mostActiveDriver.count} runs completed`,
      icon: Award,
      color: 'text-purple-500 bg-purple-50',
    },
    {
      label: 'Highest Revenue Route',
      value: highlights.topRoute,
      detail: `₹${highlights.topRevenue.toLocaleString()} generated`,
      icon: Navigation,
      color: 'text-primary bg-blue-50',
    },
  ];

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
        <Calculator className="h-4.5 w-4.5 text-primary shrink-0" />
        <CardTitle className="text-sm font-bold text-slate-900">Operational Highlights</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 font-semibold text-xs text-slate-655 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
            <div className="flex items-center space-x-2.5">
              <div className={`p-1.5 rounded-lg ${row.color} shrink-0`}>
                <row.icon className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">{row.label}</span>
                <span className="text-slate-900 font-bold text-sm block">{row.value}</span>
              </div>
            </div>
            <span className="text-slate-800 text-xs font-bold">{row.detail}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
