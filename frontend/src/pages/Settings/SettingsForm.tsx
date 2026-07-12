import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { AppWindow } from 'lucide-react';
import { toast } from 'sonner';

const settingsSchema = z.object({
  depotName: z.string().min(1, 'Depot Name is required').trim(),
  companyName: z.string().min(1, 'Company Name is required').trim(),
  currency: z.string().min(1, 'Currency is required'),
  distanceUnit: z.enum(['km', 'miles'] as const),
  fuelUnit: z.enum(['Liters', 'Gallons'] as const),
  timezone: z.string().min(1, 'Time zone is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  language: z.string().min(1, 'Language is required'),
  theme: z.enum(['Light', 'Dark', 'System'] as const),
  landingPage: z.enum(['Dashboard', 'Fleet', 'Trips'] as const),
  autoSaveInterval: z.coerce.number().gt(0, 'Interval must be greater than 0'),
  notificationPreference: z.enum(['Email', 'Browser', 'Both'] as const),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const SettingsForm: React.FC = () => {
  const { settings, saveSettings } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: settings,
  });

  // Prefill when settings loaded
  useEffect(() => {
    reset(settings);
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormValues) => {
    saveSettings(data);
    toast.success('General application settings saved successfully.');
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
        <AppWindow className="h-4.5 w-4.5 text-primary shrink-0" />
        <CardTitle className="text-sm font-bold text-slate-900">General Application Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Depot Location Name"
              id="depotName"
              placeholder="Ahmedabad Depot"
              error={errors.depotName?.message}
              disabled={isSubmitting}
              {...register('depotName')}
            />

            <Input
              label="Logistics Company Name"
              id="companyName"
              placeholder="TransitOps Logistics"
              error={errors.companyName?.message}
              disabled={isSubmitting}
              {...register('companyName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Default Currency"
              id="currency"
              options={[
                { value: 'INR', label: 'INR (₹)' },
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
              ]}
              error={errors.currency?.message}
              disabled={isSubmitting}
              {...register('currency')}
            />

            <Select
              label="Distance Unit"
              id="distanceUnit"
              options={[
                { value: 'km', label: 'Kilometers (km)' },
                { value: 'miles', label: 'Miles (mi)' },
              ]}
              error={errors.distanceUnit?.message}
              disabled={isSubmitting}
              {...register('distanceUnit')}
            />

            <Select
              label="Fuel Unit"
              id="fuelUnit"
              options={[
                { value: 'Liters', label: 'Liters (L)' },
                { value: 'Gallons', label: 'Gallons (Gal)' },
              ]}
              error={errors.fuelUnit?.message}
              disabled={isSubmitting}
              {...register('fuelUnit')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="System Time Zone"
              id="timezone"
              options={[
                { value: 'Asia/Kolkata (GMT+05:30)', label: 'Asia/Kolkata (GMT+05:30)' },
                { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
                { value: 'America/New_York (GMT-05:00)', label: 'America/New_York (GMT-05:00)' },
              ]}
              error={errors.timezone?.message}
              disabled={isSubmitting}
              {...register('timezone')}
            />

            <Select
              label="Preferred Date Format"
              id="dateFormat"
              options={[
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-07-12)' },
                { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (12-07-2026)' },
                { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY (07-12-2026)' },
              ]}
              error={errors.dateFormat?.message}
              disabled={isSubmitting}
              {...register('dateFormat')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Interface Language"
              id="language"
              options={[
                { value: 'English', label: 'English' },
                { value: 'Hindi', label: 'Hindi' },
                { value: 'Spanish', label: 'Spanish' },
              ]}
              error={errors.language?.message}
              disabled={isSubmitting}
              {...register('language')}
            />

            <Select
              label="Preferred Theme"
              id="theme"
              options={[
                { value: 'Light', label: 'Light Theme' },
                { value: 'Dark', label: 'Dark Theme' },
                { value: 'System', label: 'System Default' },
              ]}
              error={errors.theme?.message}
              disabled={isSubmitting}
              {...register('theme')}
            />

            <Select
              label="Default Landing Page"
              id="landingPage"
              options={[
                { value: 'Dashboard', label: 'Dashboard' },
                { value: 'Fleet', label: 'Fleet Registry' },
                { value: 'Trips', label: 'Trip Dispatcher' },
              ]}
              error={errors.landingPage?.message}
              disabled={isSubmitting}
              {...register('landingPage')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Auto Save Interval (min)"
              id="autoSaveInterval"
              type="number"
              placeholder="5"
              error={errors.autoSaveInterval?.message}
              disabled={isSubmitting}
              {...register('autoSaveInterval')}
            />

            <Select
              label="Alert Dispatch Preferences"
              id="notificationPreference"
              options={[
                { value: 'Email', label: 'Email Only' },
                { value: 'Browser', label: 'Browser Notifications' },
                { value: 'Both', label: 'Email & Browser' },
              ]}
              error={errors.notificationPreference?.message}
              disabled={isSubmitting}
              {...register('notificationPreference')}
            />
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto font-bold px-6">
              Save Configuration Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
