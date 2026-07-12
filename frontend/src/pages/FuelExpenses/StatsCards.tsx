import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useTrips } from '../../context/TripContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { IndianRupee, Fuel, Milestone, CreditCard } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { fuelLogs, expenses } = useExpenses();
  const { trips } = useTrips();

  // 1. Total Fuel Cost
  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.fuelCost, 0);

  // 2. Total Operational Expense
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 3. Average Fuel Efficiency (Total Distance of trips with fuel / Total Fuel Qty)
  const totalFuelQty = fuelLogs.reduce((sum, l) => sum + l.fuelQuantity, 0);
  const totalDistanceWithFuel = fuelLogs.reduce((sum, l) => {
    const trip = trips.find((t) => t.id === l.tripId);
    return sum + (trip ? trip.plannedDistance : 0);
  }, 0);
  const avgEfficiency = totalFuelQty > 0 ? (totalDistanceWithFuel / totalFuelQty).toFixed(2) : '0.00';

  // 4. Average Cost per KM (Fuel Cost + Expense Cost) / Total Distance of all completed/dispatched trips
  const totalTripsDistance = trips
    .filter((t) => t.status === 'Completed' || t.status === 'Dispatched')
    .reduce((sum, t) => sum + t.plannedDistance, 0);

  const costPerKm = totalTripsDistance > 0 
    ? ((totalFuelCost + totalExpense) / totalTripsDistance).toFixed(2) 
    : '0.00';

  const stats = [
    {
      title: 'Total Fuel Cost',
      value: `₹${totalFuelCost.toLocaleString()}`,
      icon: Fuel,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
    },
    {
      title: 'Operational Expenses',
      value: `₹${totalExpense.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-amber-500 bg-amber-50 border-amber-100',
    },
    {
      title: 'Avg Fuel Efficiency',
      value: `${avgEfficiency} km/L`,
      icon: Milestone,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Avg Cost Per KM',
      value: `₹${costPerKm}/km`,
      icon: IndianRupee,
      color: 'text-slate-500 bg-slate-50 border-slate-200',
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
