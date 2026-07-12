import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Wrench } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Workflows</h2>
        <p className="text-sm text-slate-500 mt-1">Log mechanical service events and track workshop statuses.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-4 text-primary">
            <Wrench className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl">Maintenance Module</CardTitle>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Coming in next implementation. Here you will be able to log oil changes, mechanical repairs, and manage transition rules for vehicles in shop.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};
