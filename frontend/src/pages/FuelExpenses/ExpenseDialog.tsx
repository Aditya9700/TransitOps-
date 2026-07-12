import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFleet } from '../../context/FleetContext';
import { useTrips } from '../../context/TripContext';
import { useExpenses, type Expense } from '../../context/ExpenseContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { toast } from 'sonner';

const expenseSchema = z.object({
  tripId: z.string().min(1, 'Trip assignment is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  expenseCategory: z.enum(['Toll', 'Maintenance', 'Parking', 'Repair', 'Cleaning', 'Insurance', 'Miscellaneous'] as const),
  amount: z.coerce.number().gt(0, 'Amount must be greater than 0'),
  expenseDate: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').trim(),
  status: z.enum(['Paid', 'Pending', 'Rejected'] as const),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense: Expense | null;
}

export const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  isOpen,
  onClose,
  editingExpense,
}) => {
  const { vehicles } = useFleet();
  const { trips } = useTrips();
  const { addExpense, updateExpense } = useExpenses();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      tripId: '',
      vehicleId: '',
      expenseCategory: 'Toll',
      amount: 0,
      expenseDate: '',
      description: '',
      status: 'Paid',
    },
  });

  const watchedTripId = watch('tripId');

  // Reset form inputs when dialog opens or editingExpense updates
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        reset({
          tripId: editingExpense.tripId,
          vehicleId: editingExpense.vehicleId,
          expenseCategory: editingExpense.expenseCategory,
          amount: editingExpense.amount,
          expenseDate: editingExpense.expenseDate,
          description: editingExpense.description,
          status: editingExpense.status,
        });
      } else {
        reset({
          tripId: '',
          vehicleId: '',
          expenseCategory: 'Toll',
          amount: 0,
          expenseDate: new Date().toISOString().split('T')[0],
          description: '',
          status: 'Paid',
        });
      }
    }
  }, [isOpen, editingExpense, reset]);

  // Adjust prefill vehicle based on selected trip
  useEffect(() => {
    if (watchedTripId && !editingExpense) {
      const trip = trips.find((t) => t.id === watchedTripId);
      if (trip) {
        reset((prev) => ({
          ...prev,
          vehicleId: trip.vehicleId,
        }));
      }
    }
  }, [watchedTripId, trips, editingExpense, reset]);

  const onSubmit = (data: ExpenseFormValues) => {
    if (editingExpense) {
      const res = updateExpense(editingExpense.id, data);
      if (res.success) {
        toast.success(`Expense ${editingExpense.id} updated successfully.`);
        onClose();
      } else {
        toast.error(res.error || 'Failed to update expense.');
      }
    } else {
      const res = addExpense(data);
      if (res.success) {
        toast.success(`Expense ${res.expenseId} added successfully.`);
        onClose();
      } else {
        toast.error(res.error || 'Failed to add expense.');
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
        <DialogTitle>{editingExpense ? 'Edit Expense Record' : 'Add Expense Record'}</DialogTitle>
        <DialogDescription>
          Record tolls, cleaning, repairs, parking, or miscellaneous costs linked to active trips.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Associated Trip"
            id="tripId"
            options={tripOptions}
            error={errors.tripId?.message}
            disabled={isSubmitting}
            {...register('tripId')}
          />
          <Select
            label="Associated Vehicle"
            id="vehicleId"
            options={vehicleOptions}
            error={errors.vehicleId?.message}
            disabled={isSubmitting}
            {...register('vehicleId')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Expense Category"
            id="expenseCategory"
            options={[
              { value: 'Toll', label: 'Toll Fees' },
              { value: 'Maintenance', label: 'Routine Servicing' },
              { value: 'Parking', label: 'Parking Fees' },
              { value: 'Repair', label: 'Breakdown Repairs' },
              { value: 'Cleaning', label: 'Vehicle Wash' },
              { value: 'Insurance', label: 'Insurance Dues' },
              { value: 'Miscellaneous', label: 'Miscellaneous' },
            ]}
            error={errors.expenseCategory?.message}
            disabled={isSubmitting}
            {...register('expenseCategory')}
          />
          <Input
            label="Expense Date"
            id="expenseDate"
            type="date"
            error={errors.expenseDate?.message}
            disabled={isSubmitting}
            {...register('expenseDate')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₹)"
            id="amount"
            type="number"
            placeholder="120"
            error={errors.amount?.message}
            disabled={isSubmitting}
            {...register('amount')}
          />
          <Select
            label="Payment Status"
            id="status"
            options={[
              { value: 'Paid', label: 'Paid' },
              { value: 'Pending', label: 'Pending Approval' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
            error={errors.status?.message}
            disabled={isSubmitting}
            {...register('status')}
          />
        </div>

        <Input
          label="Detailed Description"
          id="description"
          placeholder="e.g. Toll plaza NH8 exit receipt"
          error={errors.description?.message}
          disabled={isSubmitting}
          {...register('description')}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingExpense ? 'Save Changes' : 'Save Expense'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
