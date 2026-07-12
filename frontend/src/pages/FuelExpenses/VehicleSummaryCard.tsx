import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useTrips } from '../../context/TripContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Landmark, Compass, Award, Activity, Fuel, TrendingUp } from 'lucide-react';

export const VehicleSummaryCard: React.FC = () => {
  const { vehicles } = useFleet();
  const { fuelLogs, expenses } = useExpenses();
  const { records: maintenanceRecords } = useMaintenance();
  const { trips } = useTrips();

  const [selectedId, setSelectedId] = useState('');

  const selectedVehicle = vehicles.find((v) => v.id === selectedId);

  const vehicleStats = React.useMemo(() => {
    if (!selectedId) return null;

    const vFuelLogs = fuelLogs.filter((l) => l.vehicleId === selectedId);
    const vExpenses = expenses.filter((e) => e.vehicleId === selectedId);
    const vMaintenance = maintenanceRecords.filter(
      (m) => m.vehicleId === selectedId && (m.status === 'Completed' || m.status === 'Active')
    );
    const vTrips = trips.filter(
      (t) => t.vehicleId === selectedId && (t.status === 'Completed' || t.status === 'Dispatched')
    );

    const totalFuel = vFuelLogs.reduce((sum, l) => sum + l.fuelQuantity, 0);
    const fuelCost = vFuelLogs.reduce((sum, l) => sum + l.fuelCost, 0);
    const expenseCost = vExpenses.reduce((sum, e) => sum + e.amount, 0);
    const maintenanceCost = vMaintenance.reduce((sum, m) => sum + m.estimatedCost, 0);

    const runningCost = fuelCost + expenseCost + maintenanceCost;
    
    const tripCount = vTrips.length;
    const totalDistance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const mileage = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0.00';

    const revenue = vTrips.reduce((sum, t) => sum + t.expectedRevenue, 0);
    const roi = revenue - runningCost;

    return {
      totalFuel,
      runningCost,
      mileage,
      maintenanceCost,
      tripCount,
      roi,
      revenue,
    };
  }, [selectedId, fuelLogs, expenses, maintenanceRecords, trips]);

  const vehicleOptions = [
    { value: '', label: 'Select a Vehicle for lookup...' },
    ...vehicles.map((v) => ({
      value: v.id,
      label: `${v.name} (${v.registrationNumber})`,
    })),
  ];

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-slate-800">
          <Compass className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Vehicle Operational Lookup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <Select
          label="Search Vehicle Asset"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          options={vehicleOptions}
        />

        {selectedVehicle && vehicleStats ? (
          <div className="space-y-3 pt-2 font-semibold text-xs text-slate-600">
            {/* Quick metadata grid */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Status</span>
                <span className={`text-xs font-bold ${
                  selectedVehicle.status === 'Available' ? 'text-emerald-600' : 'text-primary'
                }`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Odometer</span>
                <span className="text-slate-900 block font-bold">{selectedVehicle.odometer.toLocaleString()} km</span>
              </div>
            </div>

            {/* Consumptions */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Fuel className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Fuel Consumed</span>
                  <span className="text-slate-900 font-bold">{vehicleStats.totalFuel.toLocaleString()} L</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Average Mileage</span>
                  <span className="text-slate-900 font-bold">{vehicleStats.mileage} km/L</span>
                </div>
              </div>
            </div>

            {/* Maintenance & Trips */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Landmark className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Servicing Costs</span>
                  <span className="text-slate-900 font-bold">₹{vehicleStats.maintenanceCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-purple-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Trip Count</span>
                  <span className="text-slate-900 font-bold">{vehicleStats.tripCount} dispatches</span>
                </div>
              </div>
            </div>

            {/* Total Running & ROI */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Running Cost</span>
                <span className="text-slate-900 block font-bold">₹{vehicleStats.runningCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">ROI Margin</span>
                <span className={`block font-bold flex items-center space-x-1 ${
                  vehicleStats.roi >= 0 ? 'text-emerald-600' : 'text-danger'
                }`}>
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  <span>₹{vehicleStats.roi.toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4 font-medium text-xs">
            Select a vehicle to render stats details.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
