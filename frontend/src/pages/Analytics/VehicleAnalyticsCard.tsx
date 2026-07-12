import React, { useState } from 'react';
import { type Vehicle } from '../../context/FleetContext';
import { type FuelLog, type Expense } from '../../context/ExpenseContext';
import { type MaintenanceRecord } from '../../context/MaintenanceContext';
import { type Trip } from '../../context/TripContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Search, HelpCircle } from 'lucide-react';

interface VehicleAnalyticsCardProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  maintenanceRecords: MaintenanceRecord[];
  trips: Trip[];
}

export const VehicleAnalyticsCard: React.FC<VehicleAnalyticsCardProps> = ({
  vehicles,
  fuelLogs,
  expenses,
  maintenanceRecords,
  trips,
}) => {
  const [selectedId, setSelectedId] = useState('');

  const selectedVehicle = vehicles.find((v) => v.id === selectedId);

  const stats = React.useMemo(() => {
    if (!selectedId) return null;

    const vFuel = fuelLogs.filter((l) => l.vehicleId === selectedId);
    const vExp = expenses.filter((e) => e.vehicleId === selectedId);
    const vMnt = maintenanceRecords.filter(
      (m) => m.vehicleId === selectedId && (m.status === 'Completed' || m.status === 'Active')
    );
    const vTrips = trips.filter((t) => t.vehicleId === selectedId);
    const completedTrips = vTrips.filter((t) => t.status === 'Completed');

    const totalFuel = vFuel.reduce((sum, l) => sum + l.fuelQuantity, 0);
    const fuelCost = vFuel.reduce((sum, l) => sum + l.fuelCost, 0);
    const expenseCost = vExp.reduce((sum, e) => sum + e.amount, 0);
    const maintenanceCost = vMnt.reduce((sum, m) => sum + m.estimatedCost, 0);

    const operationalCost = fuelCost + expenseCost + maintenanceCost;
    const totalDistance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const averageMileage = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0.00';

    const revenue = vTrips.reduce((sum, t) => sum + t.expectedRevenue, 0);
    
    const acquisitionCost = selectedVehicle?.acquisitionCost || 800000;
    const roi = ((revenue - operationalCost) / acquisitionCost) * 100;

    return {
      tripsCount: vTrips.length,
      completedCount: completedTrips.length,
      totalDistance,
      totalFuel,
      averageMileage,
      maintenanceCost,
      operationalCost,
      revenue,
      roi,
    };
  }, [selectedId, fuelLogs, expenses, maintenanceRecords, trips, selectedVehicle]);

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
          <Search className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Vehicle Advanced Analytics Lookup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <Select
          label="Search Vehicle Asset"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          options={vehicleOptions}
        />

        {selectedVehicle && stats ? (
          <div className="space-y-3 pt-2 font-semibold text-xs text-slate-655">
            {/* Quick specifications */}
            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              <div>
                <span>Type</span>
                <span className="text-slate-850 block font-extrabold text-xs mt-0.5">{selectedVehicle.type}</span>
              </div>
              <div>
                <span>Status</span>
                <span className={`block font-extrabold text-xs mt-0.5 ${
                  selectedVehicle.status === 'Available' ? 'text-emerald-600' : 'text-primary'
                }`}>{selectedVehicle.status}</span>
              </div>
              <div>
                <span>Acquisition Cost</span>
                <span className="text-slate-850 block font-extrabold text-xs mt-0.5">₹{(selectedVehicle.acquisitionCost || 800000).toLocaleString()}</span>
              </div>
            </div>

            {/* Trips details */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span>Total Trips (Completed / Total)</span>
              <span className="text-slate-900 font-bold">{stats.completedCount} / {stats.tripsCount}</span>
            </div>

            {/* Total distance */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span>Total Distance Traveled</span>
              <span className="text-slate-900 font-bold">{stats.totalDistance.toLocaleString()} km</span>
            </div>

            {/* Fuel Consumption */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span>Total Fuel Consumed</span>
              <span className="text-slate-900 font-bold">{stats.totalFuel.toLocaleString()} Liters</span>
            </div>

            {/* Avg Mileage */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span>Average Mileage</span>
              <span className="text-slate-900 font-bold">{stats.averageMileage} km/L</span>
            </div>

            {/* Maintenance Cost */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span>Total Maintenance Cost</span>
              <span className="text-slate-900 font-bold">₹{stats.maintenanceCost.toLocaleString()}</span>
            </div>

            {/* Operational Cost */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span>Total Operational Cost</span>
              <span className="text-slate-900 font-bold">₹{stats.operationalCost.toLocaleString()}</span>
            </div>

            {/* Revenue */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span>Revenue Generated</span>
              <span className="text-emerald-600 font-bold">₹{stats.revenue.toLocaleString()}</span>
            </div>

            {/* ROI */}
            <div className="flex justify-between items-center py-2 bg-slate-50 rounded-lg px-2.5 border border-slate-100 mt-2">
              <span className="text-slate-800 flex items-center">
                <span>Acquisition ROI Margin</span>
                <div className="relative group ml-1 shrink-0">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                  <div className="absolute left-6 bottom-0 hidden group-hover:block bg-slate-900 text-white text-[9px] font-medium p-2 rounded-lg w-40 shadow-lg z-50">
                    Formula: (Revenue - Running Cost) / Acquisition Cost * 100
                  </div>
                </div>
              </span>
              <span className={`font-bold text-sm ${stats.roi >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
                {stats.roi.toFixed(2)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-6 font-medium text-xs">
            Select a vehicle in the dropdown list for lookups.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
