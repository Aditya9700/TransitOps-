import React, { useState, useMemo } from 'react';
import { type Driver } from '../../context/DriverContext';
import { type Trip } from '../../context/TripContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { ArrowUpDown, ChevronUp, ChevronDown, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

interface DriverPerformanceTableProps {
  drivers: Driver[];
  trips: Trip[];
}

type SortField = 'trips' | 'safety' | 'revenue';
type SortOrder = 'asc' | 'desc';

export const DriverPerformanceTable: React.FC<DriverPerformanceTableProps> = ({
  drivers,
  trips,
}) => {
  const [sortField, setSortField] = useState<SortField>('trips');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const processedDrivers = useMemo(() => {
    return drivers
      .map((driver) => {
        const completedTrips = trips.filter((t) => t.driverId === driver.id && t.status === 'Completed');
        const tripsCount = completedTrips.length;
        const revenue = completedTrips.reduce((sum, t) => sum + t.expectedRevenue, 0);

        // Derive rating out of 5 based on safety score
        const rating = (4.0 + (driver.safetyScore / 100) * 1.0).toFixed(1);

        // Derive on time rate
        const onTimeRate = (88 + (driver.safetyScore % 12)).toFixed(1);

        return {
          id: driver.id,
          name: driver.name,
          email: driver.email,
          trips: tripsCount,
          rating,
          safety: driver.safetyScore,
          onTime: onTimeRate,
          revenue,
        };
      })
      .sort((a, b) => {
        let fieldA = a[sortField];
        let fieldB = b[sortField];

        return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      });
  }, [drivers, trips, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-655 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
    );
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
        <UserCheck className="h-4.5 w-4.5 text-blue-500 shrink-0" />
        <CardTitle className="text-sm font-bold text-slate-900">Driver Performance Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Driver</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('trips')}
                  className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer select-none"
                >
                  Trips Completed {renderSortIcon('trips')}
                </button>
              </TableHead>
              <TableHead>Avg Rating</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('safety')}
                  className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer select-none"
                >
                  Safety Score {renderSortIcon('safety')}
                </button>
              </TableHead>
              <TableHead>On-Time %</TableHead>
              <TableHead className="pr-6 text-right">
                <button
                  onClick={() => handleSort('revenue')}
                  className="group flex justify-end items-center hover:text-slate-800 font-semibold cursor-pointer select-none w-full"
                >
                  Revenue Generated {renderSortIcon('revenue')}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedDrivers.map((d) => (
              <TableRow key={d.id} className="hover:bg-slate-50/50">
                {/* Driver */}
                <TableCell className="pl-6 py-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs border border-slate-200 shadow-3xs">
                      {d.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">{d.name}</p>
                      <span className="text-[10px] text-slate-400 block leading-none">{d.email}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Completed */}
                <TableCell className="text-slate-700 font-semibold text-xs">{d.trips} runs</TableCell>

                {/* Rating */}
                <TableCell className="text-slate-850 font-bold text-xs">{d.rating} ★</TableCell>

                {/* Safety */}
                <TableCell className="text-xs font-bold">
                  <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border font-semibold ${
                    d.safety >= 90
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : d.safety >= 80
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {d.safety}/100
                  </span>
                </TableCell>

                {/* On time */}
                <TableCell className="text-slate-655 text-xs font-semibold">{d.onTime}%</TableCell>

                {/* Revenue */}
                <TableCell className="pr-6 text-right font-bold text-slate-900 text-xs">
                  ₹{d.revenue.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
