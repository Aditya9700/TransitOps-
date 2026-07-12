import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDrivers, type Driver } from '../../context/DriverContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { toast } from 'sonner';

// Zod schema for form validation
const driverSchema = z.object({
  name: z.string().min(1, 'Driver Name is required').trim(),
  licenseNumber: z.string().min(1, 'License Number is required').toUpperCase().trim(),
  category: z.enum(['LMV', 'HMV'] as const),
  contactNumber: z
    .string()
    .min(1, 'Phone Number is required')
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)'),
  email: z.string().min(1, 'Email is required').email('Invalid email address').trim(),
  licenseExpiry: z.string().min(1, 'License Expiry Date is required'),
  safetyScore: z.coerce
    .number()
    .min(0, 'Safety score must be at least 0')
    .max(100, 'Safety score cannot exceed 100'),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended'] as const),
});

type DriverFormValues = z.infer<typeof driverSchema>;

interface DriverFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingDriver: Driver | null;
}

export const DriverFormDialog: React.FC<DriverFormDialogProps> = ({
  isOpen,
  onClose,
  editingDriver,
}) => {
  const { addDriver, updateDriver, drivers } = useDrivers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema) as any,
    defaultValues: {
      name: '',
      licenseNumber: '',
      category: 'LMV',
      contactNumber: '',
      email: '',
      licenseExpiry: '',
      safetyScore: 90,
      status: 'Available',
    },
  });

  // Reset form when the modal opens or editingDriver changes
  useEffect(() => {
    if (isOpen) {
      if (editingDriver) {
        reset({
          name: editingDriver.name,
          licenseNumber: editingDriver.licenseNumber,
          category: editingDriver.category,
          contactNumber: editingDriver.contactNumber,
          email: editingDriver.email,
          licenseExpiry: editingDriver.licenseExpiry,
          safetyScore: editingDriver.safetyScore,
          status: editingDriver.status,
        });
      } else {
        reset({
          name: '',
          licenseNumber: '',
          category: 'LMV',
          contactNumber: '',
          email: '',
          licenseExpiry: '',
          safetyScore: 90,
          status: 'Available',
        });
      }
    }
  }, [isOpen, editingDriver, reset]);

  const onSubmit = (data: DriverFormValues) => {
    // Uniqueness validation check
    const duplicateLicense = drivers.some(
      (d) =>
        d.licenseNumber.toLowerCase() === data.licenseNumber.toLowerCase() &&
        (!editingDriver || d.id !== editingDriver.id)
    );

    if (duplicateLicense) {
      toast.error('License Number must be unique. Another driver is registered with this license.');
      return;
    }

    if (editingDriver) {
      // Edit mode
      const res = updateDriver(editingDriver.id, {
        ...data,
        tripCompletionRate: editingDriver.tripCompletionRate, // Preserve completion percentage
      });
      if (res.success) {
        toast.success(`Driver ${data.name} updated.`);
        onClose();
      } else {
        toast.error(res.error || 'Failed to update driver.');
      }
    } else {
      // Add mode
      const res = addDriver({
        ...data,
        tripCompletionRate: 100, // Default completion rate to 100% for new drivers
      });
      if (res.success) {
        toast.success(`Driver ${data.name} registered.`);
        onClose();
      } else {
        toast.error(res.error || 'Failed to register driver.');
      }
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{editingDriver ? 'Edit Driver Profile' : 'Register New Driver'}</DialogTitle>
        <DialogDescription>
          {editingDriver
            ? 'Update driver license validity, safety score, and active status.'
            : 'Fill in details to register a new driver asset in TransitOps.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Driver Name"
            id="name"
            placeholder="e.g. Rajesh Kumar"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="License Number"
            id="licenseNumber"
            placeholder="e.g. DL-858213"
            error={errors.licenseNumber?.message}
            {...register('licenseNumber')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            id="category"
            options={[
              { value: 'LMV', label: 'LMV (Light Motor Vehicle)' },
              { value: 'HMV', label: 'HMV (Heavy Motor Vehicle)' },
            ]}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            label="License Expiry Date"
            id="licenseExpiry"
            type="date"
            error={errors.licenseExpiry?.message}
            {...register('licenseExpiry')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number (10 digits)"
            id="contactNumber"
            placeholder="e.g. 9876543210"
            error={errors.contactNumber?.message}
            {...register('contactNumber')}
          />
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="e.g. driver@transitops.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Safety Score (0-100)"
            id="safetyScore"
            type="number"
            placeholder="90"
            error={errors.safetyScore?.message}
            {...register('safetyScore')}
          />
          <Select
            label="Availability Status"
            id="status"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'Off Duty', label: 'Off Duty' },
              { value: 'Suspended', label: 'Suspended' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingDriver ? 'Save Changes' : 'Register Driver'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
