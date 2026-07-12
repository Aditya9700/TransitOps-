import React from 'react';
import { Search, Fuel, CreditCard } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

interface FilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortField: 'cost' | 'date' | 'vehicle';
  setSortField: (field: 'cost' | 'date' | 'vehicle') => void;
  onLogFuelClick: () => void;
  onAddExpenseClick: () => void;
  onReset: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedVehicleId,
  setSelectedVehicleId,
  selectedCategory,
  setSelectedCategory,
  sortField,
  setSortField,
  onLogFuelClick,
  onAddExpenseClick,
  onReset,
}) => {
  const { vehicles } = useFleet();

  const vehicleOptions = [
    { value: 'All', label: 'All Vehicles' },
    ...vehicles.map((v) => ({
      value: v.id,
      label: v.name,
    })),
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-stretch gap-4 shadow-xs text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="w-full space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Search
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle, trip ID..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
            />
          </div>
        </div>

        {/* Vehicle Filter */}
        <Select
          label="Filter Vehicle"
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          options={vehicleOptions}
        />

        {/* Category Filter */}
        <Select
          label="Filter Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={[
            { value: 'All', label: 'All Categories' },
            { value: 'Fuel', label: 'Fuel Refills' },
            { value: 'Toll', label: 'Toll' },
            { value: 'Maintenance', label: 'Maintenance' },
            { value: 'Parking', label: 'Parking' },
            { value: 'Repair', label: 'Repair' },
            { value: 'Cleaning', label: 'Cleaning' },
            { value: 'Insurance', label: 'Insurance' },
            { value: 'Miscellaneous', label: 'Miscellaneous' },
          ]}
        />

        {/* Sort By Field */}
        <Select
          label="Sort By"
          value={sortField}
          onChange={(e) => setSortField(e.target.value as any)}
          options={[
            { value: 'date', label: 'Newest Date' },
            { value: 'cost', label: 'Highest Cost' },
            { value: 'vehicle', label: 'Vehicle Name' },
          ]}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        {/* Reset button */}
        <button
          onClick={onReset}
          className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer w-full sm:w-auto text-center"
        >
          Clear Filters
        </button>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button 
            onClick={onLogFuelClick} 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-initial flex items-center space-x-1.5"
          >
            <Fuel className="h-4 w-4" />
            <span>Log Fuel</span>
          </Button>
          <Button 
            onClick={onAddExpenseClick} 
            variant="primary" 
            size="sm"
            className="flex-1 sm:flex-initial flex items-center space-x-1.5"
          >
            <CreditCard className="h-4 w-4" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
