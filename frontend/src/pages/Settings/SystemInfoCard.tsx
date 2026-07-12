import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Cpu, Terminal, Calendar, Code } from 'lucide-react';

export const SystemInfoCard: React.FC = () => {
  const currentSimDate = '2026-07-12';
  const sysDetails = [
    { label: 'Application Version', value: 'v1.4.2-staging', icon: Code },
    { label: 'Runtime Environment', value: 'Local Simulation', icon: Terminal },
    { label: 'Database Service', value: 'In-Memory (localStorage)', icon: Cpu },
    { label: 'Build Framework', value: 'React 19 + Tailwind v4', icon: Calendar },
    { label: 'Simulation Target Date', value: currentSimDate, icon: Calendar },
  ];

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-sm font-bold text-slate-900">System Environment Details</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3.5">
        {sysDetails.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-2">
              <item.icon className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">{item.label}</span>
            </div>
            <span className="text-slate-950 font-bold">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
