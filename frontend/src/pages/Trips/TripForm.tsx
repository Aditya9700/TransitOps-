import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFleet } from '../../context/FleetContext';
import { useDrivers, getLicenseValidityState } from '../../context/DriverContext';
import { useTrips } from '../../context/TripContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { toast } from 'sonner';

const tripSchema = z.object({
  source: z.string().min(1, 'Source is required').trim(),
  destination: z.string().min(1, 'Destination is required').trim(),
  vehicleId: z.string().min(1, 'Vehicle selection is required'),
  driverId: z.string().min(1, 'Driver selection is required'),
  cargoWeight: z.coerce.number().gt(0, 'Cargo weight must be greater than 0'),
  plannedDistance: z.coerce.number().gt(0, 'Planned distance must be greater than 0'),
  expectedRevenue: z.coerce.number().gt(0, 'Expected revenue must be greater than 0'),
  notes: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  onValuesChange: (values: {
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    plannedDistance: number;
  }) => void;
}

export const TripForm: React.FC<TripFormProps> = ({ onValuesChange }) => {
  const { vehicles } = useFleet();
  const { drivers } = useDrivers();
  const { createTrip } = useTrips();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as any,
    defaultValues: {
      source: '',
      destination: '',
      vehicleId: '',
      driverId: '',
      cargoWeight: 0,
      plannedDistance: 0,
      expectedRevenue: 0,
      notes: '',
    },
  });

  const watchedVehicleId = watch('vehicleId');
  const watchedDriverId = watch('driverId');
  const watchedCargo = watch('cargoWeight');
  const watchedDistance = watch('plannedDistance');

  // Reactively communicate form state modifications up to parent coordinator
  useEffect(() => {
    onValuesChange({
      vehicleId: watchedVehicleId,
      driverId: watchedDriverId,
      cargoWeight: Number(watchedCargo) || 0,
      plannedDistance: Number(watchedDistance) || 0,
    });
  }, [watchedVehicleId, watchedDriverId, watchedCargo, watchedDistance, onValuesChange]);

  const selectedVehicle = vehicles.find((v) => v.id === watchedVehicleId);
  const selectedDriver = drivers.find((d) => d.id === watchedDriverId);

  const onSubmit = (data: TripFormValues) => {
    const res = createTrip(data);
    if (res.success) {
      toast.success(`Draft Trip ${res.tripId} created successfully.`);
      reset({
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeight: 0,
        plannedDistance: 0,
        expectedRevenue: 0,
        notes: '',
      });
    } else {
      toast.error(res.error || 'Failed to create trip.');
    }
  };

  // Dropdown list formatting
  const vehicleOptions = [
    { value: '', label: 'Select a Vehicle...' },
    ...vehicles.map((v) => ({
      value: v.id,
      label: `${v.name} (${v.registrationNumber}) - ${v.status}`,
    })),
  ];

  const driverOptions = [
    { value: '', label: 'Select a Driver...' },
    ...drivers.map((d) => ({
      value: d.id,
      label: `${d.name} (${d.licenseNumber}) - ${d.status}`,
    })),
  ];

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-base font-bold text-slate-900">Trip Dispatch Form</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Source & Destination */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Source City"
              id="source"
              placeholder="e.g. Ahmedabad"
              error={errors.source?.message}
              disabled={isSubmitting}
              {...register('source')}
            />
            <Input
              label="Destination City"
              id="destination"
              placeholder="e.g. Mumbai"
              error={errors.destination?.message}
              disabled={isSubmitting}
              {...register('destination')}
            />
          </div>

          {/* Vehicle Selector & Info */}
          <div className="space-y-2">
            <Select
              label="Vehicle Allocation"
              id="vehicleId"
              options={vehicleOptions}
              error={errors.vehicleId?.message}
              disabled={isSubmitting}
              {...register('vehicleId')}
            />
            {selectedVehicle && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 space-y-1 animate-fade-in font-medium">
                <div className="flex justify-between">
                  <span>Capacity: <strong className="text-slate-900">{selectedVehicle.capacity} {selectedVehicle.capacityUnit}</strong></span>
                  <span>Odometer: <strong className="text-slate-900">{selectedVehicle.odometer.toLocaleString()} km</strong></span>
                </div>
                <div>
                  <span>Current Status: </span>
                  <strong className={selectedVehicle.status === 'Available' ? 'text-emerald-600' : 'text-primary'}>
                    {selectedVehicle.status}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Driver Selector & Info */}
          <div className="space-y-2">
            <Select
              label="Driver Allocation"
              id="driverId"
              options={driverOptions}
              error={errors.driverId?.message}
              disabled={isSubmitting}
              {...register('driverId')}
            />
            {selectedDriver && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 space-y-1 animate-fade-in font-medium">
                <div className="flex justify-between">
                  <span>Safety Score: <strong className="text-slate-900">{selectedDriver.safetyScore}/100</strong></span>
                  <span>Category: <strong className="text-slate-900">{selectedDriver.category}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>License: </span>
                  <strong className={
                    getLicenseValidityState(selectedDriver.licenseExpiry) === 'Expired' ? 'text-danger' : 'text-slate-800'
                  }>
                    {getLicenseValidityState(selectedDriver.licenseExpiry)} ({selectedDriver.licenseExpiry})
                  </strong>
                  <span>Status: <strong className="text-slate-900">{selectedDriver.status}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Cargo, Distance, Revenue */}
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Cargo (kg)"
              id="cargoWeight"
              type="number"
              placeholder="500"
              error={errors.cargoWeight?.message}
              disabled={isSubmitting}
              {...register('cargoWeight')}
            />
            <Input
              label="Distance (km)"
              id="plannedDistance"
              type="number"
              placeholder="530"
              error={errors.plannedDistance?.message}
              disabled={isSubmitting}
              {...register('plannedDistance')}
            />
            <Input
              label="Revenue ($)"
              id="expectedRevenue"
              type="number"
              placeholder="15000"
              error={errors.expectedRevenue?.message}
              disabled={isSubmitting}
              {...register('expectedRevenue')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Specify special instructions or details..."
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
              disabled={isSubmitting}
              {...register('notes')}
            />
          </div>

          {/* Action Trigger Button */}
          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            Create Draft Trip
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
