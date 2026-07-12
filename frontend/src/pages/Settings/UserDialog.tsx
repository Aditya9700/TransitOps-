import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings, type DemoUser } from '../../context/SettingsContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  role: z.enum(['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] as const),
  status: z.enum(['Active', 'Inactive'] as const),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: DemoUser | null;
}

export const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  onClose,
  editingUser,
}) => {
  const { addUser, updateUser } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      role: 'Dispatcher',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        reset({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
        });
      } else {
        reset({
          name: '',
          email: '',
          role: 'Dispatcher',
          status: 'Active',
        });
      }
    }
  }, [isOpen, editingUser, reset]);

  const onSubmit = (data: UserFormValues) => {
    if (editingUser) {
      const res = updateUser(editingUser.id, {
        ...data,
        lastLogin: editingUser.lastLogin,
      });
      if (res.success) {
        toast.success(`User ${editingUser.name} profile updated.`);
        onClose();
      } else {
        toast.error('Failed to update user.');
      }
    } else {
      const res = addUser({
        ...data,
        lastLogin: 'Never logged in',
      });
      if (res.success) {
        toast.success(`User ${data.name} created successfully.`);
        onClose();
      } else {
        toast.error('Failed to add user.');
      }
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{editingUser ? 'Edit User Credentials' : 'Create Demo User'}</DialogTitle>
        <DialogDescription>
          Configure accounts and assign roles mapping to local security permissions.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <Input
          label="Full Name"
          id="name"
          placeholder="e.g. Anand Kumar"
          error={errors.name?.message}
          disabled={isSubmitting}
          {...register('name')}
        />

        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="e.g. anand@transitops.in"
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register('email')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assigned System Role"
            id="role"
            options={[
              { value: 'Fleet Manager', label: 'Fleet Manager' },
              { value: 'Dispatcher', label: 'Dispatcher' },
              { value: 'Safety Officer', label: 'Safety Officer' },
              { value: 'Financial Analyst', label: 'Financial Analyst' },
            ]}
            error={errors.role?.message}
            disabled={isSubmitting}
            {...register('role')}
          />

          <Select
            label="Account Status"
            id="status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            error={errors.status?.message}
            disabled={isSubmitting}
            {...register('status')}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingUser ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
