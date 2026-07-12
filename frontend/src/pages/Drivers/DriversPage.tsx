import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users } from 'lucide-react';

export const DriversPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Management</h2>
        <p className="text-sm text-slate-500 mt-1">Manage driver profiles, licenses validity, and safety reports.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-4 text-primary">
            <Users className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl">Drivers Module</CardTitle>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Coming in next implementation. Here you will be able to manage driver status, log contact details, and audit safety scores.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};
