import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Switch } from '../../components/ui/Switch';
import { Sliders } from 'lucide-react';
import { toast } from 'sonner';

export const PreferenceCard: React.FC = () => {
  const { preferences, savePreferences } = useSettings();

  const handleToggle = (key: keyof typeof preferences) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    savePreferences(updated);
    toast.success(`Preference '${key.replace(/([A-Z])/g, ' $1')}' updated successfully.`);
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
        <Sliders className="h-4.5 w-4.5 text-primary shrink-0" />
        <CardTitle className="text-sm font-bold text-slate-900">Application Preferences</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <Switch
          label="Enable Email Notifications"
          description="Send automated emails for critical dispatch events and system notifications."
          checked={preferences.emailAlerts}
          onChange={() => handleToggle('emailAlerts')}
        />

        <Switch
          label="Enable Browser Notifications"
          description="Display desktop push notifications when updates are received."
          checked={preferences.browserAlerts}
          onChange={() => handleToggle('browserAlerts')}
        />

        <Switch
          label="Enable Maintenance Alerts"
          description="Notify immediately when vehicles are due for scheduled inspections or exceed thresholds."
          checked={preferences.maintenanceAlerts}
          onChange={() => handleToggle('maintenanceAlerts')}
        />

        <Switch
          label="Enable License Expiry Alerts"
          description="Flag warning notifications when driver documents or licenses are within 30 days of expiring."
          checked={preferences.licenseAlerts}
          onChange={() => handleToggle('licenseAlerts')}
        />

        <Switch
          label="Enable Fuel Cost Alerts"
          description="Flag alerts for fuel pricing anomalies or sudden consumption spikes."
          checked={preferences.fuelAlerts}
          onChange={() => handleToggle('fuelAlerts')}
        />

        <Switch
          label="Enable Dashboard Animations"
          description="Use micro-transitions on graphs, charts, and interactive sidebar menus."
          checked={preferences.animations}
          onChange={() => handleToggle('animations')}
        />

        <Switch
          label="Enable Auto Refresh"
          description="Automatically sync dashboard lists and analytics charts with local changes."
          checked={preferences.autoRefresh}
          onChange={() => handleToggle('autoRefresh')}
        />

        <Switch
          label="Dark Mode Toggle"
          description="Render layout frames and panels using a dark color theme."
          checked={preferences.darkMode}
          onChange={() => handleToggle('darkMode')}
        />
      </CardContent>
    </Card>
  );
};
