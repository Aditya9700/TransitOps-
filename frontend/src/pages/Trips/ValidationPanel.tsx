import React from 'react';
import { type Vehicle } from '../../context/FleetContext';
import { type Driver, getLicenseValidityState } from '../../context/DriverContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Scale, Fuel, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ValidationPanelProps {
  selectedVehicle: Vehicle | null;
  selectedDriver: Driver | null;
  cargoWeight: number;
  plannedDistance: number;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  selectedVehicle,
  selectedDriver,
  cargoWeight,
  plannedDistance,
}) => {
  const getCapacityInKg = (vehicle: Vehicle) => {
    return vehicle.capacityUnit === 'Ton' ? vehicle.capacity * 1000 : vehicle.capacity;
  };

  const capacityInKg = selectedVehicle ? getCapacityInKg(selectedVehicle) : 0;
  const isOverloaded = selectedVehicle && cargoWeight > capacityInKg;
  const remainingCapacity = selectedVehicle ? capacityInKg - cargoWeight : 0;
  const estimatedFuel = plannedDistance > 0 ? (plannedDistance * 0.15).toFixed(1) : '0.0';

  const driverLicenseState = selectedDriver ? getLicenseValidityState(selectedDriver.licenseExpiry) : null;

  // Business Rules Checks
  const vehicleStatusAlert = selectedVehicle && selectedVehicle.status !== 'Available' ? {
    message: `Vehicle is ${selectedVehicle.status}. Dispatch locked.`,
    severity: 'error',
  } : null;

  const driverStatusAlert = selectedDriver && selectedDriver.status !== 'Available' ? {
    message: `Driver is ${selectedDriver.status}. Dispatch locked.`,
    severity: 'error',
  } : null;

  const licenseExpiryAlert = driverLicenseState === 'Expired' ? {
    message: 'Driver license is EXPIRED. Dispatch locked.',
    severity: 'error',
  } : driverLicenseState === 'Expiring Soon' ? {
    message: 'Driver license is expiring soon (within 30 days).',
    severity: 'warning',
  } : null;

  const overloadAlert = isOverloaded ? {
    message: `Cargo Weight (${cargoWeight} kg) exceeds Max Capacity (${capacityInKg} kg) by ${cargoWeight - capacityInKg} kg. Dispatch locked.`,
    severity: 'error',
  } : null;

  const alerts = [
    vehicleStatusAlert,
    driverStatusAlert,
    licenseExpiryAlert,
    overloadAlert
  ].filter(Boolean) as { message: string; severity: 'error' | 'warning' }[];

  return (
    <Card className={`bg-white border transition-all duration-300 ${isOverloaded ? 'border-red-400 shadow-md animate-bounce' : 'border-slate-200 shadow-sm'}`}>
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-sm font-semibold flex items-center space-x-2">
          <span>Live Validation & Estimates</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Estimations row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Capacity gauge */}
          <div className="rounded-lg border border-slate-150 bg-slate-50/50 p-3 text-left">
            <div className="flex items-center space-x-2 text-slate-500 mb-1">
              <Scale className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Load Compliance</span>
            </div>
            {selectedVehicle ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">
                  Capacity: {selectedVehicle.capacity} {selectedVehicle.capacityUnit} ({capacityInKg} kg)
                </p>
                <p className={`text-sm font-bold ${isOverloaded ? 'text-danger' : 'text-slate-800'}`}>
                  Remaining: {remainingCapacity.toLocaleString()} kg
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a vehicle to view load metrics.</p>
            )}
          </div>

          {/* Fuel Estimate */}
          <div className="rounded-lg border border-slate-150 bg-slate-50/50 p-3 text-left">
            <div className="flex items-center space-x-2 text-slate-500 mb-1">
              <Fuel className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Fuel</span>
            </div>
            <p className="text-sm font-bold text-slate-800">{estimatedFuel} Liters</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">(Based on 0.15L/km average)</span>
          </div>
        </div>

        {/* Live Alerts list */}
        <div className="space-y-2">
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 rounded-lg border p-3 text-xs text-left font-medium ${
                  alert.severity === 'error'
                    ? 'border-red-100 bg-red-50 text-red-700'
                    : 'border-amber-100 bg-amber-50 text-amber-700'
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{alert.message}</span>
              </div>
            ))
          ) : (
            selectedVehicle && selectedDriver && (
              <div className="flex items-center space-x-2.5 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700 text-left font-semibold">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>Trip criteria validated. Ready for dispatch!</span>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};
