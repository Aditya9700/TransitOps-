import React from 'react';
import { Search } from 'lucide-react';
import { Select } from '../../components/ui/Select';

interface FilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  sortField: 'scheduledDate' | 'estimatedCost' | 'vehicleId' | 'status';
  setSortField: (field: 'scheduledDate' | 'estimatedCost' | 'vehicleId' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onReset: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  priorityFilter,
  setPriorityFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onReset,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-stretch gap-4 shadow-xs text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="w-full space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Search Records
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle, service, mechanic..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select
          label="Job Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'Scheduled', label: 'Scheduled' },
            { value: 'Active', label: 'Active (In Shop)' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
        />

        {/* Priority Filter */}
        <Select
          label="Priority Level"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Priorities' },
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' },
          ]}
        />

        {/* Vehicle Type Filter */}
        <Select
          label="Vehicle Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Types' },
            { value: 'Van', label: 'Van' },
            { value: 'Truck', label: 'Truck' },
            { value: 'Mini', label: 'Mini' },
            { value: 'Trailer', label: 'Trailer' },
          ]}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Sort By Field */}
          <div className="w-[160px]">
            <Select
              label="Sort By"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              options={[
                { value: 'scheduledDate', label: 'Service Date' },
                { value: 'estimatedCost', label: 'Cost' },
                { value: 'vehicleId', label: 'Vehicle Name' },
                { value: 'status', label: 'Status' },
              ]}
            />
          </div>

          {/* Sort Order Direction */}
          <div className="w-[140px]">
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
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer w-full sm:w-auto shrink-0"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
