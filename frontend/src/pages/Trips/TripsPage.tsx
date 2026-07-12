import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTrips, type Trip } from '../../context/TripContext';
import { useFleet } from '../../context/FleetContext';
import { useDrivers } from '../../context/DriverContext';
import { StatsCards } from './StatsCards';
import { FilterToolbar } from './FilterToolbar';
import { TripForm } from './TripForm';
import { ValidationPanel } from './ValidationPanel';
import { TripCard } from './TripCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { AlertTriangle, Compass } from 'lucide-react';
import { toast } from 'sonner';

// Zod Schema for Trip Completion Modal Form
const completionSchema = z.object({
  finalOdometer: z.coerce.number().min(1, 'Final Odometer must be greater than 0'),
  fuelConsumed: z.coerce.number().min(0, 'Fuel consumed must be greater than or equal to 0'),
  additionalExpense: z.coerce.number().min(0, 'Additional expense must be greater than or equal to 0'),
  completionNotes: z.string().optional(),
});

type CompletionFormValues = z.infer<typeof completionSchema>;

export const TripsPage: React.FC = () => {
  const { trips, dispatchTrip, completeTrip, cancelTrip } = useTrips();
  const { vehicles } = useFleet();
  const { drivers } = useDrivers();

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<'createdDate' | 'eta' | 'status'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Reactively track left-hand side creation form selections for live validations
  const [formSelections, setFormSelections] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: 0,
    plannedDistance: 0,
  });

  const selectedVehicle = vehicles.find((v) => v.id === formSelections.vehicleId) || null;
  const selectedDriver = drivers.find((d) => d.id === formSelections.driverId) || null;

  // Complete Trip Modal State
  const [activeCompletingTrip, setActiveCompletingTrip] = useState<Trip | null>(null);
  
  // Cancel Trip Modal State
  const [activeCancellingTrip, setActiveCancellingTrip] = useState<Trip | null>(null);

  // Complete Form Hook
  const {
    register,
    handleSubmit,
    reset: resetCompletionForm,
    formState: { errors: completionErrors, isSubmitting: isCompleting },
  } = useForm<CompletionFormValues>({
    resolver: zodResolver(completionSchema) as any,
    defaultValues: {
      finalOdometer: 0,
      fuelConsumed: 0,
      additionalExpense: 0,
      completionNotes: '',
    },
  });

  const handleOpenComplete = (trip: Trip) => {
    const v = vehicles.find((vehicle) => vehicle.id === trip.vehicleId);
    setActiveCompletingTrip(trip);
    resetCompletionForm({
      finalOdometer: v ? v.odometer + trip.plannedDistance : 0, // Auto pre-fill with estimated final odometer
      fuelConsumed: Math.ceil(trip.plannedDistance * 0.15), // Auto pre-fill with estimated fuel
      additionalExpense: 0,
      completionNotes: '',
    });
  };

  const onCompleteSubmit = (data: CompletionFormValues) => {
    if (!activeCompletingTrip) return;

    const res = completeTrip(activeCompletingTrip.id, data);
    if (res.success) {
      toast.success(`Trip ${activeCompletingTrip.id} completed successfully.`);
      setActiveCompletingTrip(null);
    } else {
      toast.error(res.error || 'Failed to complete trip.');
    }
  };

  const handleDispatch = (id: string) => {
    const res = dispatchTrip(id);
    if (res.success) {
      toast.success(`Trip ${id} dispatched successfully. Vehicle and driver status updated to On Trip.`);
    } else {
      toast.error(res.error || 'Failed to dispatch trip.');
    }
  };

  const handleCancelConfirm = () => {
    if (!activeCancellingTrip) return;

    const res = cancelTrip(activeCancellingTrip.id);
    if (res.success) {
      toast.success(`Trip ${activeCancellingTrip.id} cancelled. Assets restored to Available.`);
      setActiveCancellingTrip(null);
    } else {
      toast.error(res.error || 'Failed to cancel trip.');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortField('createdDate');
    setSortOrder('desc');
  };

  // Combine Search, Filters and Sorts
  const processedTrips = useMemo(() => {
    return trips
      .filter((trip) => {
        // Find driver and vehicle names for relational search
        const d = drivers.find((driver) => driver.id === trip.driverId);
        const v = vehicles.find((vehicle) => vehicle.id === trip.vehicleId);

        // Search matching
        const matchesSearch =
          trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (v && v.name.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter status matching
        const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let fieldA = a[sortField] || '';
        let fieldB = b[sortField] || '';

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return sortOrder === 'asc'
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        }
        return 0;
      });
  }, [trips, searchQuery, statusFilter, sortField, sortOrder, drivers, vehicles]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trip Dispatcher</h2>
          <p className="text-sm text-slate-500 mt-1">Create, dispatch, monitor and manage transport trips.</p>
        </div>
      </div>

      {/* Metrics Header */}
      <StatsCards />

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Trip Creation & Estimations Panel (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TripForm onValuesChange={setFormSelections} />
          
          <ValidationPanel
            selectedVehicle={selectedVehicle}
            selectedDriver={selectedDriver}
            cargoWeight={formSelections.cargoWeight}
            plannedDistance={formSelections.plannedDistance}
          />

          {/* Static Compliance Check card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Compass className="h-4 w-4 text-primary shrink-0" />
              <span>Dispatch Check-rules</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 pl-3 list-disc font-medium leading-relaxed">
              <li>Vehicle must be Available (not In Shop, Retired, or On Trip).</li>
              <li>Driver must be Available (not Off Duty, Suspended, or On Trip).</li>
              <li>Driver's license validity state must be strictly Valid.</li>
              <li>Trip Cargo Weight cannot exceed the Max Capacity of the vehicle.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Active Board Log (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Board toolbar search */}
          <FilterToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onReset={handleResetFilters}
          />

          {/* Cards listing */}
          <div className="space-y-4 max-h-[100vh] overflow-y-auto pr-1">
            {processedTrips.length > 0 ? (
              processedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDispatch={handleDispatch}
                  onCompleteClick={handleOpenComplete}
                  onCancelClick={setActiveCancellingTrip}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl">
                <AlertTriangle className="h-10 w-10 text-slate-350 mb-3" />
                <h4 className="text-sm font-bold text-slate-900">No Trips Found</h4>
                <p className="text-xs text-slate-500 mt-1.5">
                  No active routes matched your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Dialog Modal */}
      <Dialog isOpen={!!activeCompletingTrip} onClose={() => setActiveCompletingTrip(null)}>
        <DialogHeader>
          <DialogTitle>Complete Shift log: {activeCompletingTrip?.id}</DialogTitle>
          <DialogDescription>
            Record odometer details, actual fuel liters consumed, and additional expenses for final ROI calculation.
          </DialogDescription>
        </DialogHeader>

        {activeCompletingTrip && (
          <form onSubmit={handleSubmit(onCompleteSubmit)} className="space-y-4 text-left">
            <Input
              label="Final Odometer Reading (km)"
              id="finalOdometer"
              type="number"
              placeholder="e.g. 74530"
              error={completionErrors.finalOdometer?.message}
              disabled={isCompleting}
              {...register('finalOdometer')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fuel Consumed (Liters)"
                id="fuelConsumed"
                type="number"
                placeholder="e.g. 80"
                error={completionErrors.fuelConsumed?.message}
                disabled={isCompleting}
                {...register('fuelConsumed')}
              />
              <Input
                label="Additional Expense ($)"
                id="additionalExpense"
                type="number"
                placeholder="e.g. 1200"
                error={completionErrors.additionalExpense?.message}
                disabled={isCompleting}
                {...register('additionalExpense')}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="completionNotes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Completion Notes / Comments
              </label>
              <textarea
                id="completionNotes"
                rows={2}
                placeholder="Driver comments, delay alerts or damage logs..."
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
                disabled={isCompleting}
                {...register('completionNotes')}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveCompletingTrip(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="success" isLoading={isCompleting}>
                Save & Complete Trip
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      {/* Cancel Trip Confirmation Modal */}
      <Dialog isOpen={!!activeCancellingTrip} onClose={() => setActiveCancellingTrip(null)}>
        <DialogHeader>
          <DialogTitle className="text-danger flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirm Trip Cancellation</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel trip <strong>{activeCancellingTrip?.id}</strong> from {activeCancellingTrip?.source} to {activeCancellingTrip?.destination}?
            <br />
            {activeCancellingTrip?.status === 'Dispatched' && (
              <span className="text-xs text-amber-600 font-semibold mt-2 block">
                ⚠ Note: The allocated driver and vehicle will immediately reset to 'Available' status.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setActiveCancellingTrip(null)}>
            Cancel Action
          </Button>
          <Button type="button" variant="danger" onClick={handleCancelConfirm}>
            Cancel Trip Dispatch
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
