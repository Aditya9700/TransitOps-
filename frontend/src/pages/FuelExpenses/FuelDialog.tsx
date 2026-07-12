import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFleet } from '../../context/FleetContext';
import { useDrivers } from '../../context/DriverContext';
import { useTrips } from '../../context/TripContext';
import { useExpenses, type FuelLog } from '../../context/ExpenseContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { toast } from 'sonner';

const fuelSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  tripId: z.string().min(1, 'Trip assignment is required'),
  driverId: z.string().min(1, 'Driver is required'),
  date: z.string().min(1, 'Fueling Date is required'),
  fuelQuantity: z.coerce.number().gt(0, 'Quantity must be greater than 0'),
  fuelCost: z.coerce.number().gt(0, 'Cost must be greater than 0'),
  odometer: z.coerce.number().min(0, 'Odometer reading must be positive'),
  fuelStation: z.string().min(1, 'Fuel station is required').trim(),
  notes: z.string().optional(),
});

type FuelFormValues = z.infer<typeof fuelSchema>;

interface FuelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog: FuelLog | null;
}

export const FuelDialog: React.FC<FuelDialogProps> = ({
  isOpen,
  onClose,
  editingLog,
}) => {
  const { vehicles } = useFleet();
  const { drivers } = useDrivers();
  const { trips } = useTrips();
  const { addFuelLog, updateFuelLog } = useExpenses();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FuelFormValues>({
    resolver: zodResolver(fuelSchema) as any,
    defaultValues: {
      vehicleId: '',
      tripId: '',
      driverId: '',
      date: '',
      fuelQuantity: 0,
      fuelCost: 0,
      odometer: 0,
      fuelStation: '',
      notes: '',
    },
  });

  const watchedVehicleId = watch('vehicleId');

  // Reset form inputs when dialog opens or editingLog updates
  useEffect(() => {
    if (isOpen) {
      if (editingLog) {
        reset({
          vehicleId: editingLog.vehicleId,
          tripId: editingLog.tripId,
          driverId: editingLog.driverId,
          date: editingLog.date,
          fuelQuantity: editingLog.fuelQuantity,
          fuelCost: editingLog.fuelCost,
          odometer: editingLog.odometer,
          fuelStation: editingLog.fuelStation,
          notes: editingLog.notes || '',
        });
      } else {
        reset({
          vehicleId: '',
          tripId: '',
          driverId: '',
          date: new Date().toISOString().split('T')[0],
          fuelQuantity: 0,
          fuelCost: 0,
          odometer: 0,
          fuelStation: '',
          notes: '',
        });
      }
    }
  }, [isOpen, editingLog, reset]);

  // Adjust prefill odometer when selected vehicle changes
  useEffect(() => {
    if (watchedVehicleId && !editingLog) {
      const v = vehicles.find((vehicle) => vehicle.id === watchedVehicleId);
      if (v) {
        reset((prev) => ({
          ...prev,
          odometer: v.odometer,
        }));
      }
    }
  }, [watchedVehicleId, vehicles, editingLog, reset]);

  const onSubmit = (data: FuelFormValues) => {
    // Custom Odometer check
    const vehicle = vehicles.find((v) => v.id === data.vehicleId);
    if (vehicle && data.odometer < vehicle.odometer && (!editingLog || editingLog.vehicleId !== data.vehicleId)) {
      setError('odometer', {
        message: `Odometer reading must be at least the vehicle's current odometer (${vehicle.odometer.toLocaleString()} km)`,
      });
      return;
    }

    if (editingLog) {
      const res = updateFuelLog(editingLog.id, data);
      if (res.success) {
        toast.success(`Fuel log ${editingLog.id} updated successfully.`);
        onClose();
      } else {
        toast.error(res.error || 'Failed to update fuel log.');
      }
    } else {
      const res = addFuelLog(data);
      if (res.success) {
        toast.success(`Fuel log ${res.logId} saved successfully.`);
        onClose();
      } else {
        toast.error(res.error || 'Failed to log fuel refuel.');
      }
    }
  };

  const vehicleOptions = [
    { value: '', label: 'Select Vehicle...' },
    ...vehicles.map((v) => ({
      value: v.id,
      label: `${v.name} (${v.registrationNumber})`,
    })),
  ];

  const driverOptions = [
    { value: '', label: 'Select Driver...' },
    ...drivers.map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ];

  const tripOptions = [
    { value: '', label: 'Select Trip...' },
    ...trips.map((t) => ({
      value: t.id,
      label: `${t.id} (${t.source} ➔ ${t.destination})`,
    })),
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{editingLog ? 'Edit Fuel Transaction' : 'Log Fuel Refill'}</DialogTitle>
        <DialogDescription>
          Record fuel quantities, odometer logs, and purchase costs for running-cost analytics.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Vehicle Asset"
            id="vehicleId"
            options={vehicleOptions}
            error={errors.vehicleId?.message}
            disabled={isSubmitting}
            {...register('vehicleId')}
          />
          <Select
            label="Associated Trip ID"
            id="tripId"
            options={tripOptions}
            error={errors.tripId?.message}
            disabled={isSubmitting}
            {...register('tripId')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Driver"
            id="driverId"
            options={driverOptions}
            error={errors.driverId?.message}
            disabled={isSubmitting}
            {...register('driverId')}
          />
          <Input
            label="Refuel Date"
            id="date"
            type="date"
            error={errors.date?.message}
            disabled={isSubmitting}
            {...register('date')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Fuel Quantity (L)"
            id="fuelQuantity"
            type="number"
            placeholder="50"
            error={errors.fuelQuantity?.message}
            disabled={isSubmitting}
            {...register('fuelQuantity')}
          />
          <Input
            label="Total Cost (₹)"
            id="fuelCost"
            type="number"
            placeholder="4250"
            error={errors.fuelCost?.message}
            disabled={isSubmitting}
            {...register('fuelCost')}
          />
          <Input
            label="Odometer (km)"
            id="odometer"
            type="number"
            placeholder="74000"
            error={errors.odometer?.message}
            disabled={isSubmitting}
            {...register('odometer')}
          />
        </div>

        <Input
          label="Fuel Station Provider"
          id="fuelStation"
          placeholder="e.g. IndianOil Depot, Jaipur"
          error={errors.fuelStation?.message}
          disabled={isSubmitting}
          {...register('fuelStation')}
        />

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Add gas receipt numbers, station details or pump defects..."
            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
            disabled={isSubmitting}
            {...register('notes')}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingLog ? 'Save Refuel' : 'Save Fuel Log'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
