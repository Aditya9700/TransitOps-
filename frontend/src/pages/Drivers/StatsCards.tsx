import React from 'react';
import { useDrivers, getLicenseValidityState } from '../../context/DriverContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Users, CheckCircle, Navigation, AlertTriangle } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { drivers } = useDrivers();

  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter((d) => d.status === 'Available').length;
  const onTripDrivers = drivers.filter((d) => d.status === 'On Trip').length;
  const expiredLicenses = drivers.filter((d) => getLicenseValidityState(d.licenseExpiry) === 'Expired').length;

  const stats = [
    {
      title: 'Total Drivers',
      value: totalDrivers,
      icon: Users,
      color: 'text-slate-500 bg-slate-50 border-slate-200',
    },
    {
      title: 'Available Drivers',
      value: availableDrivers,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Drivers On Trip',
      value: onTripDrivers,
      icon: Navigation,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
    },
    {
      title: 'Expired Licenses',
      value: expiredLicenses,
      icon: AlertTriangle,
      color: expiredLicenses > 0 
        ? 'text-red-500 bg-red-50 border-red-100 animate-pulse' 
        : 'text-slate-500 bg-slate-50 border-slate-200',
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
