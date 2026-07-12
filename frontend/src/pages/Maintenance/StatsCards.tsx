import React from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useFleet } from '../../context/FleetContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Wrench, Hotel, CheckCircle, IndianRupee } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { records } = useMaintenance();
  const { vehicles } = useFleet();

  const totalJobs = records.length;
  
  // Live calculation of vehicles currently in shop from Fleet state
  const vehiclesInShop = vehicles.filter((v) => v.status === 'In Shop').length;

  // Completed records
  const completedJobs = records.filter((r) => r.status === 'Completed').length;

  // Sum of all completed / active costs
  const totalCost = records
    .filter((r) => r.status === 'Completed' || r.status === 'Active')
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  const stats = [
    {
      title: 'Total Maintenance Jobs',
      value: totalJobs,
      icon: Wrench,
      color: 'text-slate-500 bg-slate-50 border-slate-200',
    },
    {
      title: 'Vehicles In Shop',
      value: vehiclesInShop,
      icon: Hotel,
      color: vehiclesInShop > 0 
        ? 'text-orange-500 bg-orange-50 border-orange-100 animate-pulse' 
        : 'text-slate-500 bg-slate-50 border-slate-200',
    },
    {
      title: 'Completed Jobs',
      value: completedJobs,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Total Maintenance Cost',
      value: `₹${totalCost.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {stat.title}
            </span>
            <div className={`p-2 rounded-lg ${stat.color} shrink-0`}>
              <stat.icon className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
