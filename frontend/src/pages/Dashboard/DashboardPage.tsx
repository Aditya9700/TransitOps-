import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import {
  Truck,
  CheckCircle,
  Wrench,
  Navigation,
  Clock,
  Users,
  Gauge,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // Demo KPI statistics
  const kpiStats = [
    { title: 'Active Vehicles', value: '53', icon: Truck, color: 'text-blue-500 bg-blue-50' },
    { title: 'Available Vehicles', value: '42', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
    { title: 'Vehicles in Maintenance', value: '5', icon: Wrench, color: 'text-amber-500 bg-amber-50' },
    { title: 'Active Trips', value: '18', icon: Navigation, color: 'text-sky-500 bg-sky-50' },
    { title: 'Pending Trips', value: '9', icon: Clock, color: 'text-purple-500 bg-purple-50' },
    { title: 'Drivers On Duty', value: '26', icon: Users, color: 'text-teal-500 bg-teal-50' },
    { title: 'Fleet Utilization', value: '81%', icon: Gauge, color: 'text-indigo-500 bg-indigo-50', isPercentage: true },
  ];

  // Demo Data for Status Donut Chart
  const statusChartData = [
    { name: 'Available', value: 42, color: '#10b981' }, // Emerald-500
    { name: 'On Trip', value: 18, color: '#3b82f6' },   // Blue-500
    { name: 'In Shop', value: 5, color: '#f59e0b' },    // Amber-500
    { name: 'Retired', value: 2, color: '#94a3b8' },    // Slate-400
  ];

  // Demo Data for Recent Trips
  const recentTrips = [
    { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip' as const, duration: '45 min' },
    { id: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed' as const, duration: '--' },
    { id: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched' as const, duration: '1h 10m' },
  ];

  const getTripStatusBadgeVariant = (status: 'On Trip' | 'Completed' | 'Dispatched' | 'Cancelled') => {
    switch (status) {
      case 'On Trip':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Dispatched':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const handleResetFilters = () => {
    setVehicleFilter('All');
    setStatusFilter('All');
    setRegionFilter('All');
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time tracking metrics and operations control center.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Vehicle Type"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Vehicles' },
                { value: 'Van', label: 'Vans Only' },
                { value: 'Truck', label: 'Heavy Trucks' },
                { value: 'Minivan', label: 'Minivans' },
              ]}
            />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Available', label: 'Available' },
                { value: 'On Trip', label: 'On Trip' },
                { value: 'In Shop', label: 'In Shop (Maintenance)' },
                { value: 'Retired', label: 'Retired' },
              ]}
            />
            <Select
              label="Region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Regions' },
                { value: 'North', label: 'North Sector' },
                { value: 'East', label: 'East Sector' },
                { value: 'South', label: 'South Sector' },
                { value: 'West', label: 'West Sector' },
              ]}
            />
          </div>
          <button
            onClick={handleResetFilters}
            className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer w-full md:w-auto shrink-0"
          >
            Clear Filters
          </button>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpiStats.map((stat, idx) => (
          <Card key={idx} className="bg-white flex flex-col justify-between hover:shadow-xs transition-shadow duration-200">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate max-w-[80%]">
                {stat.title}
              </span>
              <div className={`p-1.5 rounded-lg ${stat.color} shrink-0`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold tracking-tight text-slate-900">{stat.value}</span>
                {stat.isPercentage && (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500 self-center ml-1 shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Visuals & Recent Data Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table - Left Grid */}
        <Card className="lg:col-span-2 bg-white flex flex-col">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Latest dispatch updates and active driver shifts.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Trip ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-semibold text-slate-900 pl-6">{trip.id}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{trip.vehicle}</TableCell>
                    <TableCell className="text-slate-600">{trip.driver}</TableCell>
                    <TableCell>
                      <Badge variant={getTripStatusBadgeVariant(trip.status)}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 pr-6 text-right font-medium">{trip.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Status Distribution Donut Chart - Right Grid */}
        <Card className="bg-white flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Vehicle Status</CardTitle>
            <CardDescription>Overview of active status distribution.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: '500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
