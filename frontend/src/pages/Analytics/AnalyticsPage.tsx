import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">Generate reports on fuel efficiency, vehicle ROI, and fleet status.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-4 text-primary">
            <BarChart3 className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl">Analytics Module</CardTitle>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Coming in next implementation. Here you will be able to export CSV/PDF reports, analyze charts, and audit vehicle ROI formulas.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};
