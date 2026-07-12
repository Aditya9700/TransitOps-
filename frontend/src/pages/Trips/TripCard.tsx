import React from 'react';
import { type Trip } from '../../context/TripContext';
import { useFleet } from '../../context/FleetContext';
import { useDrivers } from '../../context/DriverContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  ArrowRight, 
  MapPin, 
  User, 
  Truck, 
  Navigation,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onDispatch: (id: string) => void;
  onCompleteClick: (trip: Trip) => void;
  onCancelClick: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onDispatch,
  onCompleteClick,
  onCancelClick,
}) => {
  const { vehicles } = useFleet();
  const { drivers } = useDrivers();

  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
  const driver = drivers.find((d) => d.id === trip.driverId);

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'Dispatched':
        return <Badge variant="primary">Dispatched</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Custom Stepper/Timeline logic
  const steps = [
    { label: 'Created', date: trip.createdDate, active: true },
    { 
      label: 'Dispatched', 
      date: trip.dispatchedDate, 
      active: trip.status === 'Dispatched' || trip.status === 'Completed' 
    },
    { 
      label: trip.status === 'Cancelled' ? 'Cancelled' : 'Completed', 
      date: trip.status === 'Cancelled' ? trip.cancelledDate : trip.completedDate,
      active: trip.status === 'Completed' || trip.status === 'Cancelled'
    }
  ];

  return (
    <Card className="bg-white border border-slate-200 shadow-xs text-left hover:shadow-xs transition-shadow duration-200">
      <CardContent className="p-5 space-y-4">
        {/* Header: ID & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900">{trip.id}</span>
            {getStatusBadge(trip.status)}
          </div>
          {trip.eta && trip.status === 'Dispatched' && (
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
              ETA: {trip.eta}
            </span>
          )}
        </div>

        {/* Route: Source to Destination */}
        <div className="flex items-center space-x-3 py-1">
          <div className="flex items-center space-x-1.5 min-w-0">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-sm font-bold text-slate-800 truncate">{trip.source}</span>
          </div>
          <ArrowRight className="h-4.5 w-4.5 text-slate-300 shrink-0" />
          <div className="flex items-center space-x-1.5 min-w-0">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-slate-800 truncate">{trip.destination}</span>
          </div>
        </div>

        {/* Relational details: Vehicle & Driver */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-2 min-w-0">
            <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {vehicle ? `${vehicle.name} (${vehicle.registrationNumber})` : 'Unknown Vehicle'}
            </span>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {driver ? driver.name : 'Unknown Driver'}
            </span>
          </div>
        </div>

        {/* Financials & Capacity */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-150 text-[11px] font-semibold text-slate-600">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Cargo</span>
            <span className="text-slate-800">{trip.cargoWeight.toLocaleString()} kg</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Distance</span>
            <span className="text-slate-800">{trip.plannedDistance} km</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Est. Rev</span>
            <span className="text-slate-800">${trip.expectedRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Stepper Timeline Visualizer */}
        <div className="flex items-center justify-between pt-1 pb-2">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center flex-1 relative min-w-0">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shrink-0 ${
                  step.active 
                    ? trip.status === 'Cancelled' && idx === 2
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-primary bg-blue-50 text-primary' 
                    : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}>
                  {idx === 2 ? (
                    trip.status === 'Cancelled' ? <XCircle className="h-3.5 w-3.5" /> : trip.status === 'Completed' ? <CheckCircle className="h-3.5 w-3.5" /> : '3'
                  ) : idx === 1 && (trip.status === 'Dispatched' || trip.status === 'Completed') ? (
                    <Navigation className="h-3 w-3 fill-current rotate-45" />
                  ) : idx === 0 ? (
                    <FileText className="h-3 w-3" />
                  ) : String(idx + 1)}
                </div>
                <span className={`text-[10px] font-semibold mt-1 truncate max-w-full ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                {step.date && (
                  <span className="text-[9px] text-slate-400 font-medium">{step.date}</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-4 border-t border-dashed ${
                  steps[idx + 1].active ? 'border-primary' : 'border-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Logs/Notes logged on Completion */}
        {trip.status === 'Completed' && (
          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-150">
            <div className="grid grid-cols-3 gap-2 font-medium">
              <span>Final Odometer: <strong className="text-slate-700">{trip.finalOdometer?.toLocaleString()} km</strong></span>
              <span>Fuel: <strong className="text-slate-700">{trip.fuelConsumed} L</strong></span>
              <span>Expense: <strong className="text-slate-700">${trip.additionalExpense}</strong></span>
            </div>
            {trip.completionNotes && (
              <p className="mt-1 italic text-slate-500 font-medium">
                Note: "{trip.completionNotes}"
              </p>
            )}
          </div>
        )}

        {/* Actions panel */}
        {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            {trip.status === 'Draft' && (
              <>
                <Button 
                  onClick={() => onDispatch(trip.id)} 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                >
                  Dispatch
                </Button>
                <Button 
                  onClick={() => onCancelClick(trip)} 
                  variant="outline" 
                  size="sm"
                  className="text-slate-500"
                >
                  Cancel
                </Button>
              </>
            )}
            {trip.status === 'Dispatched' && (
              <>
                <Button 
                  onClick={() => onCompleteClick(trip)} 
                  variant="success" 
                  size="sm" 
                  className="flex-1"
                >
                  Complete Trip
                </Button>
                <Button 
                  onClick={() => onCancelClick(trip)} 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Cancel Trip
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
