import React from 'react';
import { type FuelLog } from '../../context/ExpenseContext';
import { useFleet } from '../../context/FleetContext';
import { useDrivers } from '../../context/DriverContext';
import { useTrips } from '../../context/TripContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Edit2, Trash2, Fuel } from 'lucide-react';

interface FuelTableProps {
  logs: FuelLog[];
  onEdit: (log: FuelLog) => void;
  onDelete: (log: FuelLog) => void;
}

export const FuelTable: React.FC<FuelTableProps> = ({
  logs,
  onEdit,
  onDelete,
}) => {
  const { vehicles } = useFleet();
  const { drivers } = useDrivers();
  const { trips } = useTrips();

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl">
        <div className="rounded-full bg-slate-50 p-4 text-slate-400 mb-4 border border-slate-100">
          <Fuel className="h-10 w-10" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900">No fuel records found</h4>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          Try resetting filters or adding a new fuel log.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Vehicle</TableHead>
              <TableHead>Trip ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fuel Quantity</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Price / L</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Fuel Efficiency</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const vehicle = vehicles.find((v) => v.id === log.vehicleId);
              const driver = drivers.find((d) => d.id === log.driverId);
              const trip = trips.find((t) => t.id === log.tripId);

              const pricePerLiter = log.fuelQuantity > 0 ? (log.fuelCost / log.fuelQuantity).toFixed(2) : '0.00';
              const mileage = trip && log.fuelQuantity > 0 ? (trip.plannedDistance / log.fuelQuantity).toFixed(2) : null;

              return (
                <TableRow key={log.id} className="hover:bg-slate-50/50">
                  {/* Vehicle */}
                  <TableCell className="pl-6 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate mb-0.5">
                        {vehicle ? vehicle.name : 'Unknown'}
                      </p>
                      <span className="text-xs text-slate-400 font-mono">
                        {vehicle ? vehicle.registrationNumber : '—'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Trip ID */}
                  <TableCell className="font-semibold text-slate-700">{log.tripId}</TableCell>

                  {/* Date */}
                  <TableCell className="text-slate-600 font-medium">{log.date}</TableCell>

                  {/* Quantity */}
                  <TableCell className="text-slate-800 font-semibold">{log.fuelQuantity} Liters</TableCell>

                  {/* Cost */}
                  <TableCell className="text-slate-850 font-bold">₹{log.fuelCost.toLocaleString()}</TableCell>

                  {/* Price per Liter */}
                  <TableCell className="text-slate-500 font-medium">₹{pricePerLiter}/L</TableCell>

                  {/* Odometer */}
                  <TableCell className="text-slate-600 font-medium">{log.odometer.toLocaleString()} km</TableCell>

                  {/* Mileage */}
                  <TableCell className="font-semibold text-slate-800">
                    {mileage ? `${mileage} km/L` : '—'}
                  </TableCell>

                  {/* Driver */}
                  <TableCell className="text-slate-700 font-medium">{driver ? driver.name : '—'}</TableCell>

                  {/* Actions */}
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end items-center space-x-2.5">
                      <button
                        onClick={() => onEdit(log)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit refuel log"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(log)}
                        className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
