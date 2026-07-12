import React from 'react';
import { Search } from 'lucide-react';
import { Select } from '../../components/ui/Select';

interface FilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortField: 'createdDate' | 'eta' | 'status';
  setSortField: (field: 'createdDate' | 'eta' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onReset: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onReset,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col md:flex-row items-end gap-4 shadow-xs">
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="w-full space-y-1.5 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Search Trips
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, driver, vehicle, city..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select
          label="Trip Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Dispatched', label: 'Dispatched' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
        />

        {/* Sort By Field */}
        <Select
          label="Sort By"
          value={sortField}
          onChange={(e) => setSortField(e.target.value as any)}
          options={[
            { value: 'createdDate', label: 'Trip Date' },
            { value: 'eta', label: 'ETA / Duration' },
            { value: 'status', label: 'Status' },
          ]}
        />

        {/* Sort Direction */}
        <Select
          label="Order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          options={[
            { value: 'desc', label: 'Newest First / Desc' },
            { value: 'asc', label: 'Oldest First / Asc' },
          ]}
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer w-full md:w-auto shrink-0"
      >
        Clear
      </button>
    </div>
  );
};
