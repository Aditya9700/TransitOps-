import React, { useState, useMemo } from 'react';
import { useFleet } from '../../context/FleetContext';
import { useDrivers } from '../../context/DriverContext';
import { useTrips } from '../../context/TripContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useExpenses } from '../../context/ExpenseContext';
import { MetricCard } from './MetricCard';
import { ChartCard } from './ChartCard';
import { LeaderboardCard } from './LeaderboardCard';
import { DriverPerformanceTable } from './DriverPerformanceTable';
import { VehicleAnalyticsCard } from './VehicleAnalyticsCard';
import { BusinessInsightCard } from './BusinessInsightCard';
import { HealthScoreCard } from './HealthScoreCard';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { RefreshCw, Download, FileText, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

type QuickFilter = 'Today' | 'Last 7 Days' | 'Last Month' | 'This Quarter' | 'All Time';

export const AnalyticsPage: React.FC = () => {
  const { vehicles } = useFleet();
  const { drivers } = useDrivers();
  const { trips } = useTrips();
  const { records: maintenanceRecords } = useMaintenance();
  const { fuelLogs, expenses } = useExpenses();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('All Time');

  // Trigger re-calc simulation toast
  const handleRefresh = () => {
    toast.success('Analytics dashboards re-calculated from database successfully.');
  };

  const handleExportCSV = () => {
    let csv = 'Vehicle Asset,Registration Number,Total Trips,Planned Distance (km),Fuel Consumed (L),Fuel Expense (INR),Maintenance Servicing (INR),Tolls & Parking (INR),Total Running Cost (INR),Revenue Generated (INR),ROI Ratio (%)\n';
    
    vehicles.forEach((v) => {
      const vFuel = fuelLogs.filter((l) => l.vehicleId === v.id);
      const vExp = expenses.filter((e) => e.vehicleId === v.id);
      const vMnt = maintenanceRecords.filter(
        (m) => m.vehicleId === v.id && (m.status === 'Completed' || m.status === 'Active')
      );
      const vTrips = trips.filter((t) => t.vehicleId === v.id);
      
      const distance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
      const fuelQty = vFuel.reduce((sum, l) => sum + l.fuelQuantity, 0);
      const fuelCost = vFuel.reduce((sum, l) => sum + l.fuelCost, 0);
      const otherExpense = vExp.reduce((sum, e) => sum + e.amount, 0);
      const maintCost = vMnt.reduce((sum, m) => sum + m.estimatedCost, 0);

      const runningCost = fuelCost + otherExpense + maintCost;
      const revenue = vTrips.filter((t) => t.status === 'Completed').reduce((sum, t) => sum + t.expectedRevenue, 0);
      
      const acqCost = v.acquisitionCost || 800000;
      const roi = ((revenue - runningCost) / acqCost) * 100;

      csv += `"${v.name}","${v.registrationNumber}",${vTrips.length},${distance},${fuelQty},${fuelCost},${maintCost},${otherExpense},${runningCost},${revenue},${roi.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transitops_fleet_report_${quickFilter.toLowerCase().replace(' ', '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fleet performance CSV exported successfully.');
  };

  const handleExportPDF = () => {
    window.print();
    toast.success('PDF print layouts rendered.');
  };

  // Helper date filter comparison based on simulated anchor "2026-07-12"
  const filterByDate = (dateStr: string) => {
    if (quickFilter === 'All Time') return true;
    const logDate = new Date(dateStr);
    const simDate = new Date('2026-07-12'); // Simulation Reference Date
    const diffTime = simDate.getTime() - logDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (quickFilter === 'Today') {
      return dateStr === '2026-07-12';
    }
    if (quickFilter === 'Last 7 Days') {
      return diffDays >= 0 && diffDays <= 7;
    }
    if (quickFilter === 'Last Month') {
      return diffDays >= 0 && diffDays <= 30;
    }
    if (quickFilter === 'This Quarter') {
      return diffDays >= 0 && diffDays <= 90;
    }
    return true;
  };

  // Processed listings based on filters
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedVehicleType === 'All' || v.type === selectedVehicleType;
      const matchesStatus = selectedStatus === 'All' || v.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchQuery, selectedVehicleType, selectedStatus]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const vehicle = vehicles.find((v) => v.id === t.vehicleId);
      const driver = drivers.find((d) => d.id === t.driverId);

      const matchesSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle && vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (driver && driver.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDate = filterByDate(t.dispatchedDate || t.createdDate);
      const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [trips, vehicles, drivers, searchQuery, selectedStatus, quickFilter]);

  const filteredFuelLogs = useMemo(() => {
    return fuelLogs.filter((l) => filterByDate(l.date));
  }, [fuelLogs, quickFilter]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => filterByDate(e.expenseDate));
  }, [expenses, quickFilter]);

  // If no vehicles or trips matched, show empty state
  const isEmpty = filteredVehicles.length === 0 && filteredTrips.length === 0;

  // Compute live KPIs
  const kpis = useMemo(() => {
    const totalRevenue = filteredTrips.reduce((sum, t) => sum + t.expectedRevenue, 0);

    const fuelCost = filteredFuelLogs.reduce((sum, l) => sum + l.fuelCost, 0);
    const mntCost = maintenanceRecords
      .filter((m) => filterByDate(m.scheduledDate) && (m.status === 'Completed' || m.status === 'Active'))
      .reduce((sum, m) => sum + m.estimatedCost, 0);
    const expenseCost = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const operationalCost = fuelCost + mntCost + expenseCost;
    
    // Utilization
    const activeOnTrip = vehicles.filter((v) => v.status === 'On Trip').length;
    const activeVehicles = vehicles.filter((v) => v.status !== 'Retired').length;
    const utilization = activeVehicles > 0 ? Math.round((activeOnTrip / activeVehicles) * 100) : 0;

    // Fuel efficiency
    const totalFuelLiters = filteredFuelLogs.reduce((sum, l) => sum + l.fuelQuantity, 0);
    const distanceWithFuel = filteredFuelLogs.reduce((sum, l) => {
      const trip = trips.find((t) => t.id === l.tripId);
      return sum + (trip ? trip.plannedDistance : 0);
    }, 0);
    const avgEfficiency = totalFuelLiters > 0 ? (distanceWithFuel / totalFuelLiters).toFixed(1) : '8.2';

    // ROI
    const totalAcqCost = vehicles.filter((v) => v.status !== 'Retired').reduce((sum, v) => sum + (v.acquisitionCost || 800000), 0);
    const roi = totalAcqCost > 0 ? ((totalRevenue - operationalCost) / totalAcqCost) * 100 : 12.8;

    // Completed
    const completedCount = filteredTrips.filter((t) => t.status === 'Completed').length;
    
    // Avg Distance
    const totalDistance = filteredTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const avgDistance = filteredTrips.length > 0 ? Math.round(totalDistance / filteredTrips.length) : 0;

    // Cost per KM
    const costPerKm = totalDistance > 0 ? (operationalCost / totalDistance).toFixed(2) : '0.00';

    return {
      revenue: totalRevenue,
      operationalCost,
      utilization,
      efficiency: avgEfficiency,
      roi: roi.toFixed(1),
      completed: completedCount,
      avgDistance,
      costPerKm,
    };
  }, [filteredTrips, filteredFuelLogs, filteredExpenses, maintenanceRecords, vehicles, trips, quickFilter]);

  // Chart data preps
  const monthlyRevenueData = useMemo(() => {
    // Group completed trips by month
    const groups: Record<string, number> = {
      'Jan': 480000, 'Feb': 510000, 'Mar': 560000, 'Apr': 540000, 'May': 620000, 'Jun': 590000, 'Jul': 345000,
    };

    filteredTrips
      .filter((t) => t.status === 'Completed')
      .forEach((t) => {
        const date = new Date(t.dispatchedDate || t.createdDate);
        const m = date.toLocaleString('default', { month: 'short' });
        groups[m] = (groups[m] || 0) + t.expectedRevenue;
      });

    return Object.entries(groups).map(([month, val]) => ({ month, revenue: val }));
  }, [filteredTrips]);

  const monthlyCostData = useMemo(() => {
    const groups: Record<string, number> = {
      'Jan': 140000, 'Feb': 155000, 'Mar': 168000, 'Apr': 162000, 'May': 188000, 'Jun': 180000, 'Jul': 120000,
    };

    // add in-memory cost refs
    filteredFuelLogs.forEach((l) => {
      const m = new Date(l.date).toLocaleString('default', { month: 'short' });
      groups[m] = (groups[m] || 0) + l.fuelCost;
    });

    filteredExpenses.forEach((e) => {
      const m = new Date(e.expenseDate).toLocaleString('default', { month: 'short' });
      groups[m] = (groups[m] || 0) + e.amount;
    });

    return Object.entries(groups).map(([month, val]) => ({ month, cost: val }));
  }, [filteredFuelLogs, filteredExpenses]);

  const utilizationTrendData = [
    { date: '07-06', utilization: 72 },
    { date: '07-07', utilization: 78 },
    { date: '07-08', utilization: 81 },
    { date: '07-09', utilization: 85 },
    { date: '07-10', utilization: 83 },
    { date: '07-11', utilization: 80 },
    { date: '07-12', utilization: kpis.utilization || 81 },
  ];

  const fuelConsumptionData = useMemo(() => {
    return vehicles.slice(0, 7).map((v) => {
      const totalQty = fuelLogs
        .filter((l) => l.vehicleId === v.id)
        .reduce((sum, l) => sum + l.fuelQuantity, 0);
      return { name: v.name, quantity: totalQty || 20 };
    });
  }, [vehicles, fuelLogs]);

  const expenseBreakdownData = useMemo(() => {
    const categories = ['Toll', 'Maintenance', 'Parking', 'Repair', 'Cleaning', 'Insurance', 'Miscellaneous'];
    return categories.map((cat) => {
      const amt = expenses
        .filter((e) => e.expenseCategory === cat)
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: cat, value: amt || 500 };
    });
  }, [expenses]);

  const tripStatusData = useMemo(() => {
    const statuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
    return statuses.map((stat) => {
      const count = trips.filter((t) => t.status === stat).length;
      return { name: stat, value: count || 1 };
    });
  }, [trips]);

  const vehicleStatusData = useMemo(() => {
    const statuses = ['Available', 'On Trip', 'In Shop', 'Retired'];
    return statuses.map((stat) => {
      const count = vehicles.filter((v) => v.status === stat).length;
      return { status: stat, value: count || 0 };
    });
  }, [vehicles]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 text-left">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Fleet performance, operational insights and business intelligence.
          </p>
        </div>

        {/* Executive Action Controls */}
        <div className="flex items-center space-x-3">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center space-x-1.5">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center space-x-1.5">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button onClick={handleExportPDF} variant="primary" size="sm" className="flex items-center space-x-1.5">
            <FileText className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Filter Bar & Quick Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-4 shadow-2xs text-left">
        {/* Row 1: Period selectors */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100">
          {(['Today', 'Last 7 Days', 'Last Month', 'This Quarter', 'All Time'] as QuickFilter[]).map((period) => (
            <button
              key={period}
              onClick={() => setQuickFilter(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                quickFilter === period
                  ? 'bg-slate-900 text-white shadow-3xs'
                  : 'bg-slate-50 text-slate-655 hover:bg-slate-100'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Row 2: Relational search & filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle or driver..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-300 focus:outline-hidden"
            />
          </div>

          <Select
            label="Vehicle Type"
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
            options={[
              { value: 'All', label: 'All Types' },
              { value: 'Truck', label: 'Truck' },
              { value: 'Trailer', label: 'Trailer' },
              { value: 'Container', label: 'Container' },
              { value: 'Van', label: 'Van' },
              { value: 'Mini Truck', label: 'Mini Truck' },
            ]}
          />

          <Select
            label="Region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            options={[
              { value: 'All', label: 'All Regions' },
              { value: 'North India', label: 'North India' },
              { value: 'West India', label: 'West India' },
              { value: 'South India', label: 'South India' },
            ]}
          />

          <Select
            label="Status Filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'In Shop', label: 'In Shop' },
              { value: 'Completed', label: 'Completed Trips' },
            ]}
          />
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200 rounded-xl">
          <div className="rounded-full bg-slate-50 p-4 text-slate-400 mb-4">
            <LayoutGrid className="h-12 w-12" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">No analytics available</h4>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            No trips, costs, or status records matched your search parameters. Try clearing filters.
          </p>
        </div>
      ) : (
        <>
          {/* 3. KPI Cards grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Fuel Efficiency"
              value={`${kpis.efficiency} km/L`}
              trend="+4.3%"
              isPositive={true}
              sparklineData={[7.8, 8.0, 8.1, 7.9, 8.2, 8.3, parseFloat(kpis.efficiency)]}
              formulaDescription="Fuel Efficiency = Distance / Fuel Consumed"
            />
            <MetricCard
              title="Fleet Utilization"
              value={`${kpis.utilization}%`}
              trend="+6.0%"
              isPositive={true}
              sparklineData={[68, 70, 75, 78, 81, 80, kpis.utilization]}
              formulaDescription="Fleet Utilization = Vehicles on Trip / Active Vehicles"
            />
            <MetricCard
              title="Operational Cost"
              value={`₹${kpis.operationalCost.toLocaleString()}`}
              trend="-2.1%"
              isPositive={true}
              sparklineData={[36000, 35000, 34800, 35200, 34500, 34070, kpis.operationalCost]}
              formulaDescription="Operational Cost = Fuel + Maintenance + Tolls & Expenses"
            />
            <MetricCard
              title="Vehicle ROI"
              value={`${kpis.roi}%`}
              trend="+1.2%"
              isPositive={true}
              sparklineData={[11.5, 12.0, 12.5, 12.2, 13.0, 13.8, parseFloat(kpis.roi)]}
              formulaDescription="Vehicle ROI = (Revenue - Running Cost) / Acquisition Cost"
            />
            <MetricCard
              title="Revenue Generated"
              value={`₹${kpis.revenue.toLocaleString()}`}
              trend="+8.5%"
              isPositive={true}
              sparklineData={[280000, 300000, 320000, 310000, 335000, 345000, kpis.revenue]}
            />
            <MetricCard
              title="Completed Trips"
              value={`${kpis.completed} runs`}
              trend="+14%"
              isPositive={true}
              sparklineData={[10, 12, 13, 11, 14, 15, kpis.completed]}
            />
            <MetricCard
              title="Average Trip Distance"
              value={`${kpis.avgDistance} km`}
              trend="+3.2%"
              isPositive={true}
              sparklineData={[580, 600, 620, 610, 630, 625, kpis.avgDistance]}
            />
            <MetricCard
              title="Average Cost per KM"
              value={`₹${kpis.costPerKm}/km`}
              trend="-1.5%"
              isPositive={true}
              sparklineData={[12.8, 12.5, 12.4, 12.6, 12.3, 12.1, parseFloat(kpis.costPerKm)]}
              formulaDescription="Cost per KM = Operational Cost / Total Distance"
            />
          </div>

          {/* 4. Fleet Health Score & Recommendations */}
          <HealthScoreCard
            vehicles={vehicles}
            drivers={drivers}
            fuelLogs={fuelLogs}
            trips={trips}
          />

          {/* 5. Executive Recharts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard title="Monthly Revenue Trend (₹)" type="revenue" data={monthlyRevenueData} />
            <ChartCard title="Monthly Running Costs (₹)" type="cost" data={monthlyCostData} />
            <ChartCard title="Fleet Utilization (%)" type="utilization" data={utilizationTrendData} />
            <ChartCard title="Fuel Consumption by Vehicle (L)" type="fuel" data={fuelConsumptionData} />
            <ChartCard title="Operational Expense Categories" type="expenses" data={expenseBreakdownData} />
            <ChartCard title="Trip Dispatch Distribution" type="tripStatus" data={tripStatusData} />
            <ChartCard title="Vehicle Allocation Statuses" type="vehicleStatus" data={vehicleStatusData} />
          </div>

          {/* 6. Rankings & Analytical Lookups Section */}
          <LeaderboardCard
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            expenses={expenses}
            maintenanceRecords={maintenanceRecords}
            trips={trips}
          />

          {/* 7. Bottom panels: Lookup card and highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <VehicleAnalyticsCard
                vehicles={vehicles}
                fuelLogs={fuelLogs}
                expenses={expenses}
                maintenanceRecords={maintenanceRecords}
                trips={trips}
              />
            </div>
            <div className="lg:col-span-7">
              <BusinessInsightCard
                vehicles={vehicles}
                drivers={drivers}
                fuelLogs={fuelLogs}
                expenses={expenses}
                maintenanceRecords={maintenanceRecords}
                trips={trips}
              />
            </div>
          </div>

          {/* 8. Driver Leaderboard Table */}
          <DriverPerformanceTable drivers={drivers} trips={trips} />
        </>
      )}
    </div>
  );
};
