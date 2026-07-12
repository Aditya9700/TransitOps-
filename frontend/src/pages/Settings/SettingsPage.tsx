import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Settings } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure workspace variables and system profiles.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-4 text-primary">
            <Settings className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl">Settings Module</CardTitle>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Coming in next implementation. Here you will customize dashboard filters, notification settings, and manage platform roles.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};
