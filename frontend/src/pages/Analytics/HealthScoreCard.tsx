import React, { useMemo } from 'react';
import { type Vehicle } from '../../context/FleetContext';
import { type Driver } from '../../context/DriverContext';
import { type FuelLog } from '../../context/ExpenseContext';
import { type Trip } from '../../context/TripContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

interface HealthScoreCardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  fuelLogs: FuelLog[];
  trips: Trip[];
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  vehicles,
  drivers,
  fuelLogs,
  trips,
}) => {
  const { score, status, color, textColor, recommendations } = useMemo(() => {
    // 1. Calculate sub-metrics
    const completedTrips = trips.filter((t) => t.status === 'Completed').length;
    const totalTrips = trips.length;
    const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 100;

    const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
    const activeVehicles = vehicles.filter((v) => v.status === 'On Trip').length;
    const totalVehicles = vehicles.filter((v) => v.status !== 'Retired').length;
    
    const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
    const availabilityRate = totalVehicles > 0 ? (availableVehicles / totalVehicles) * 100 : 100;

    // Compile dynamic health score out of 100
    const finalScore = Math.round(
      completionRate * 0.3 + 
      utilizationRate * 0.3 + 
      availabilityRate * 0.4
    );

    // Status ratings
    let statusStr = 'Good';
    let statusColor = '#3b82f6'; // blue
    let textColor = 'text-blue-600';

    if (finalScore >= 85) {
      statusStr = 'Excellent';
      statusColor = '#10b981'; // green
      textColor = 'text-emerald-600';
    } else if (finalScore >= 70) {
      statusStr = 'Good';
      statusColor = '#3b82f6'; // blue
      textColor = 'text-blue-600';
    } else if (finalScore >= 50) {
      statusStr = 'Needs Attention';
      statusColor = '#f97316'; // orange
      textColor = 'text-orange-500';
    } else {
      statusStr = 'Critical';
      statusColor = '#ef4444'; // red
      textColor = 'text-red-600';
    }

    // 2. Generate Top 5 Action Recommendations based on state details
    const recs: string[] = [];

    // Rule A: Check for low-efficiency heavy vehicles
    vehicles.forEach((vehicle) => {
      const vFuel = fuelLogs.filter((l) => l.vehicleId === vehicle.id);
      const fuelQty = vFuel.reduce((sum, l) => sum + l.fuelQuantity, 0);
      const vTrips = trips.filter((t) => t.vehicleId === vehicle.id && t.status === 'Completed');
      const totalDistance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
      const efficiency = fuelQty > 0 ? totalDistance / fuelQty : 0;

      if (efficiency > 0 && efficiency < 5.5 && recs.length < 5) {
        recs.push(`Improve fuel efficiency parameters for ${vehicle.name} (${vehicle.registrationNumber}).`);
      }
    });

    // Rule B: Check for unassigned / low utilization vehicles
    vehicles.forEach((vehicle) => {
      const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id);
      if (vehicleTrips.length === 0 && vehicle.status === 'Available' && recs.length < 5) {
        recs.push(`Increase fleet utilization of idle asset ${vehicle.name}.`);
      }
    });

    // Rule C: High safety rating drivers praise
    drivers.forEach((driver) => {
      if (driver.safetyScore >= 96 && recs.length < 5) {
        recs.push(`Driver ${driver.name} has consistently high safety performance. Reward compliance.`);
      }
    });

    // Rule D: Vehicles currently In Shop
    vehicles.forEach((vehicle) => {
      if (vehicle.status === 'In Shop' && recs.length < 5) {
        recs.push(`Review repair schedule of ${vehicle.name} to minimize turnaround times.`);
      }
    });

    // Fallbacks to generic actions if we have fewer than 5
    if (recs.length < 1) recs.push('Review route costs on Delhi ➔ Jaipur to optimize margins.');
    if (recs.length < 2) recs.push('Review odometer offsets on trailer assets.');
    if (recs.length < 3) recs.push('Increase driver safety training checks.');
    if (recs.length < 4) recs.push('Schedule preventive AC service checks for mini trucks.');
    if (recs.length < 5) recs.push('Perform carbon wash checks on vehicles older than 5 years.');

    return {
      score: finalScore,
      status: statusStr,
      color: statusColor,
      textColor,
      recommendations: recs.slice(0, 5),
    };
  }, [vehicles, drivers, fuelLogs, trips]);

  // SVG parameters
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
      {/* 1. Progress circle visualizer */}
      <Card className="bg-white border border-slate-200 shadow-sm xl:col-span-1">
        <CardHeader className="border-b border-slate-100 p-4">
          <CardTitle className="text-sm font-bold text-slate-900">Fleet Health Rating</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative h-[120px] w-[120px]">
            <svg className="transform -rotate-90" width={size} height={size}>
              <circle
                stroke="#f1f5f9"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              <circle
                stroke={color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-950 leading-none">{score}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Score</span>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400">Compliance Status</span>
            <h4 className={`text-base font-black tracking-tight ${textColor}`}>{status}</h4>
          </div>
        </CardContent>
      </Card>

      {/* 2. Top 5 recommendations lists */}
      <Card className="bg-white border border-slate-200 shadow-sm xl:col-span-2">
        <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
          <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
          <CardTitle className="text-sm font-bold text-slate-900">Top 5 Action Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <ul className="space-y-3">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs font-medium text-slate-655 border-b border-slate-50 last:border-0 pb-2.5 last:pb-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                  {idx + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
