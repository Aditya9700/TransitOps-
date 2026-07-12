import React, { useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useFleet } from '../../context/FleetContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useTrips } from '../../context/TripContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Fuel, ShieldAlert, ZapOff, Hammer } from 'lucide-react';

export const QuickInsights: React.FC = () => {
  const { fuelLogs, expenses } = useExpenses();
  const { vehicles } = useFleet();
  const { records: maintenanceRecords } = useMaintenance();
  const { trips } = useTrips();

  const insights = useMemo(() => {
    let highestConsumer = { name: 'None', reg: '', value: 0 };
    let mostExpensive = { name: 'None', reg: '', value: 0 };
    let lowestEfficiency = { name: 'None', reg: '', value: Infinity };
    let highestMaintenance = { name: 'None', reg: '', value: 0 };

    vehicles.forEach((vehicle) => {
      // Fuel Quantity
      const logs = fuelLogs.filter((l) => l.vehicleId === vehicle.id);
      const fuelQtySum = logs.reduce((sum, l) => sum + l.fuelQuantity, 0);
      const fuelCostSum = logs.reduce((sum, l) => sum + l.fuelCost, 0);

      // Expenses
      const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
      const expenseSum = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Maintenance
      const maintenanceSum = maintenanceRecords
        .filter((m) => m.vehicleId === vehicle.id && (m.status === 'Completed' || m.status === 'Active'))
        .reduce((sum, m) => sum + m.estimatedCost, 0);

      // Total Running Cost
      const totalCost = fuelCostSum + expenseSum + maintenanceSum;

      // Distance
      const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id && (t.status === 'Completed' || t.status === 'Dispatched'));
      const totalDistance = vehicleTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
      const efficiency = fuelQtySum > 0 ? totalDistance / fuelQtySum : null;

      // Check highest consumer
      if (fuelQtySum > highestConsumer.value) {
        highestConsumer = { name: vehicle.name, reg: vehicle.registrationNumber, value: fuelQtySum };
      }

      // Check most expensive running cost
      if (totalCost > mostExpensive.value) {
        mostExpensive = { name: vehicle.name, reg: vehicle.registrationNumber, value: totalCost };
      }

      // Check lowest efficiency (must have driven some distance)
      if (efficiency !== null && efficiency > 0 && efficiency < lowestEfficiency.value) {
        lowestEfficiency = { name: vehicle.name, reg: vehicle.registrationNumber, value: efficiency };
      }

      // Check highest maintenance cost
      if (maintenanceSum > highestMaintenance.value) {
        highestMaintenance = { name: vehicle.name, reg: vehicle.registrationNumber, value: maintenanceSum };
      }
    });

    return {
      highestConsumer,
      mostExpensive,
      lowestEfficiency: lowestEfficiency.value === Infinity ? { name: 'N/A', reg: '—', value: 0 } : lowestEfficiency,
      highestMaintenance,
    };
  }, [vehicles, fuelLogs, expenses, maintenanceRecords, trips]);

  const cards = [
    {
      title: 'Highest Fuel Consumer',
      vehicleName: insights.highestConsumer.name,
      reg: insights.highestConsumer.reg,
      details: `${insights.highestConsumer.value.toLocaleString()} Liters`,
      icon: Fuel,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
    },
    {
      title: 'Most Expensive Vehicle',
      vehicleName: insights.mostExpensive.name,
      reg: insights.mostExpensive.reg,
      details: `₹${insights.mostExpensive.value.toLocaleString()} total cost`,
      icon: ShieldAlert,
      color: 'text-red-500 bg-red-50 border-red-100',
    },
    {
      title: 'Lowest Fuel Efficiency',
      vehicleName: insights.lowestEfficiency.name,
      reg: insights.lowestEfficiency.reg,
      details: `${insights.lowestEfficiency.value.toFixed(2)} km/L avg`,
      icon: ZapOff,
      color: 'text-orange-500 bg-orange-50 border-orange-100',
    },
    {
      title: 'Highest Maintenance Cost',
      vehicleName: insights.highestMaintenance.name,
      reg: insights.highestMaintenance.reg,
      details: `₹${insights.highestMaintenance.value.toLocaleString()} in shop`,
      icon: Hammer,
      color: 'text-amber-500 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="bg-white border-dashed border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {card.title}
            </span>
            <div className={`p-1.5 rounded-lg ${card.color} shrink-0`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-left space-y-1">
            <h4 className="text-sm font-bold text-slate-900 leading-none">
              {card.vehicleName}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 block leading-none">
              {card.reg}
            </span>
            <p className="text-xs text-slate-500 font-semibold pt-1 border-t border-slate-100 mt-2">
              {card.details}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
