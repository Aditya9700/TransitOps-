import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFleet } from '../../context/FleetContext';
import { useMaintenance, type MaintenanceRecord } from '../../context/MaintenanceContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle selection is required'),
  serviceType: z.string().min(1, 'Service Type description is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  category: z.enum(['Oil Change', 'Engine Repair', 'Tyre Replacement', 'Brake Service', 'Battery', 'General Inspection'] as const),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  estimatedCompletion: z.string().optional(),
  estimatedCost: z.coerce.number().min(0, 'Estimated cost must be greater than or equal to 0'),
  mechanicName: z.string().min(1, 'Mechanic name is required').trim(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical'] as const),
  status: z.enum(['Scheduled', 'Active', 'Completed', 'Cancelled'] as const),
  notes: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  editingRecord: MaintenanceRecord | null;
  onCancelEdit: () => void;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  editingRecord,
  onCancelEdit,
}) => {
  const { vehicles } = useFleet();
  const { records, addRecord, updateRecord } = useMaintenance();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema) as any,
    defaultValues: {
      vehicleId: '',
      serviceType: '',
      description: '',
      category: 'Oil Change',
      scheduledDate: '',
      estimatedCompletion: '',
      estimatedCost: 0,
      mechanicName: '',
      priority: 'Medium',
      status: 'Scheduled',
      notes: '',
    },
  });

  const watchedVehicleId = watch('vehicleId');

  // Reset form when editingRecord updates
  useEffect(() => {
    if (editingRecord) {
      reset({
        vehicleId: editingRecord.vehicleId,
        serviceType: editingRecord.serviceType,
        description: editingRecord.description,
        category: editingRecord.category,
        scheduledDate: editingRecord.scheduledDate,
        estimatedCompletion: editingRecord.estimatedCompletion || '',
        estimatedCost: editingRecord.estimatedCost,
        mechanicName: editingRecord.mechanicName,
        priority: editingRecord.priority,
        status: editingRecord.status,
        notes: editingRecord.notes || '',
      });
    } else {
      reset({
        vehicleId: '',
        serviceType: '',
        description: '',
        category: 'Oil Change',
        scheduledDate: '',
        estimatedCompletion: '',
        estimatedCost: 0,
        mechanicName: '',
        priority: 'Medium',
        status: 'Scheduled',
        notes: '',
      });
    }
  }, [editingRecord, reset]);

  const selectedVehicle = vehicles.find((v) => v.id === watchedVehicleId);

  // Dynamic calculations for selected vehicle (from context)
  const vehicleStats = React.useMemo(() => {
    if (!watchedVehicleId) return null;

    const vehicleRecords = records.filter((r) => r.vehicleId === watchedVehicleId);
    const completedRecords = vehicleRecords.filter((r) => r.status === 'Completed');
    
    // Last Maintenance Date
    let lastDate = 'None';
    if (completedRecords.length > 0) {
      const dates = completedRecords.map((r) => new Date(r.scheduledDate).getTime());
      const latestTimestamp = Math.max(...dates);
      lastDate = new Date(latestTimestamp).toISOString().split('T')[0];
    }

    // Est. Next Service Date (Rough projection: last service + 6 months)
    let nextServiceDate = 'Scheduled in 6 months';
    if (lastDate !== 'None') {
      const last = new Date(lastDate);
      last.setMonth(last.getMonth() + 6);
      nextServiceDate = last.toISOString().split('T')[0];
    }

    return {
      historyCount: completedRecords.length,
      lastMaintenanceDate: lastDate,
      estimatedNextService: nextServiceDate,
    };
  }, [watchedVehicleId, records]);

  const onSubmit = (data: MaintenanceFormValues) => {
    // If vehicle is On Trip and status set to Active, warn and block
    if (selectedVehicle && selectedVehicle.status === 'On Trip' && data.status === 'Active') {
      toast.error('Vehicle currently on active trip. Maintenance cannot begin.');
      return;
    }

    if (editingRecord) {
      const res = updateRecord(editingRecord.id, data);
      if (res.success) {
        toast.success(`Maintenance record ${editingRecord.id} updated.`);
        onCancelEdit();
      } else {
        toast.error(res.error || 'Failed to update record.');
      }
    } else {
      const res = addRecord(data);
      if (res.success) {
        toast.success(`Maintenance record ${res.recordId} scheduled.`);
        reset({
          vehicleId: '',
          serviceType: '',
          description: '',
          category: 'Oil Change',
          scheduledDate: '',
          estimatedCompletion: '',
          estimatedCost: 0,
          mechanicName: '',
          priority: 'Medium',
          status: 'Scheduled',
          notes: '',
        });
      } else {
        toast.error(res.error || 'Failed to create record.');
      }
    }
  };

  const vehicleOptions = [
    { value: '', label: 'Select a Vehicle...' },
    ...vehicles.map((v) => ({
      value: v.id,
      label: `${v.name} (${v.registrationNumber}) - ${v.status}`,
    })),
  ];

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-900">
          {editingRecord ? 'Edit Repair Log' : 'Schedule Maintenance'}
        </CardTitle>
        {editingRecord && (
          <button
            onClick={onCancelEdit}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Cancel Edit
          </button>
        )}
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Vehicle Dropdown */}
          <div className="space-y-2">
            <Select
              label="Select Vehicle"
              id="vehicleId"
              options={vehicleOptions}
              error={errors.vehicleId?.message}
              disabled={isSubmitting}
              {...register('vehicleId')}
            />
            {/* Live Vehicle Stats Info block */}
            {selectedVehicle && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 space-y-1 font-medium animate-fade-in">
                <div className="flex justify-between">
                  <span>Status: <strong className={selectedVehicle.status === 'Available' ? 'text-emerald-600' : selectedVehicle.status === 'In Shop' ? 'text-orange-500' : 'text-primary'}>{selectedVehicle.status}</strong></span>
                  <span>Odometer: <strong className="text-slate-900">{selectedVehicle.odometer.toLocaleString()} km</strong></span>
                </div>
                {vehicleStats && (
                  <>
                    <div className="flex justify-between">
                      <span>Service History: <strong className="text-slate-900">{vehicleStats.historyCount} jobs</strong></span>
                      <span>Last Service: <strong className="text-slate-900">{vehicleStats.lastMaintenanceDate}</strong></span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1 border-t border-slate-200/50 pt-1">
                      <span>Next Due: <strong>{vehicleStats.estimatedNextService}</strong></span>
                      <span>Type: <strong>{selectedVehicle.type}</strong></span>
                    </div>
                  </>
                )}
                {selectedVehicle.status === 'On Trip' && (
                  <div className="flex items-center space-x-1.5 text-red-600 text-[10px] font-bold pt-1.5 border-t border-red-100 mt-1.5 animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Vehicle currently on active trip. Maintenance cannot begin.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Service Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Service Type"
              id="serviceType"
              placeholder="e.g. Alternate Check"
              error={errors.serviceType?.message}
              disabled={isSubmitting}
              {...register('serviceType')}
            />
            <Select
              label="Category"
              id="category"
              options={[
                { value: 'Oil Change', label: 'Oil Change' },
                { value: 'Engine Repair', label: 'Engine Repair' },
                { value: 'Tyre Replacement', label: 'Tyre Replacement' },
                { value: 'Brake Service', label: 'Brake Service' },
                { value: 'Battery', label: 'Battery Swap' },
                { value: 'General Inspection', label: 'General Inspection' },
              ]}
              error={errors.category?.message}
              disabled={isSubmitting}
              {...register('category')}
            />
          </div>

          {/* Description */}
          <Input
            label="Service Description"
            id="description"
            placeholder="e.g. Swapping engine radiator hose clamp"
            error={errors.description?.message}
            disabled={isSubmitting}
            {...register('description')}
          />

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              id="scheduledDate"
              type="date"
              error={errors.scheduledDate?.message}
              disabled={isSubmitting}
              {...register('scheduledDate')}
            />
            <Input
              label="Est. Completion Date"
              id="estimatedCompletion"
              type="date"
              error={errors.estimatedCompletion?.message}
              disabled={isSubmitting}
              {...register('estimatedCompletion')}
            />
          </div>

          {/* Cost & Mechanic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estimated Cost (₹)"
              id="estimatedCost"
              type="number"
              placeholder="15000"
              error={errors.estimatedCost?.message}
              disabled={isSubmitting}
              {...register('estimatedCost')}
            />
            <Input
              label="Mechanic Name"
              id="mechanicName"
              placeholder="e.g. Ramesh Sharma"
              error={errors.mechanicName?.message}
              disabled={isSubmitting}
              {...register('mechanicName')}
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              id="priority"
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
              error={errors.priority?.message}
              disabled={isSubmitting}
              {...register('priority')}
            />
            <Select
              label="Job Status"
              id="status"
              options={[
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Active', label: 'Active (In Shop)' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              error={errors.status?.message}
              disabled={isSubmitting}
              {...register('status')}
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
              placeholder="Add auxiliary details, mechanic logs, or spare part quotes..."
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
              disabled={isSubmitting}
              {...register('notes')}
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            {editingRecord ? 'Save Changes' : 'Schedule Log'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
