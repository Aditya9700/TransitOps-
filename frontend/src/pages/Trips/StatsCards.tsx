import React from 'react';
import { useTrips } from '../../context/TripContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Route, FileText, Navigation, CheckCircle, XCircle } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { trips } = useTrips();

  const totalTrips = trips.length;
  const draftTrips = trips.filter((t) => t.status === 'Draft').length;
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const completedTrips = trips.filter((t) => t.status === 'Completed').length;
  const cancelledTrips = trips.filter((t) => t.status === 'Cancelled').length;

  const stats = [
    {
      title: 'Total Trips',
      value: totalTrips,
      icon: Route,
      color: 'text-slate-500 bg-slate-50 border-slate-200',
    },
    {
      title: 'Drafts',
      value: draftTrips,
      icon: FileText,
      color: 'text-slate-400 bg-slate-50 border-slate-200',
    },
    {
      title: 'Active Trips',
      value: activeTrips,
      icon: Navigation,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
    },
    {
      title: 'Completed',
      value: completedTrips,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Cancelled',
      value: cancelledTrips,
      icon: XCircle,
      color: 'text-red-500 bg-red-50 border-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate max-w-[80%]">
              {stat.title}
            </span>
            <div className={`p-1.5 rounded-lg ${stat.color} shrink-0`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
