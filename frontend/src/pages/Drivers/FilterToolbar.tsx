import React from 'react';
import { Search } from 'lucide-react';
import { Select } from '../../components/ui/Select';

interface FilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  validityFilter: string;
  setValidityFilter: (validity: string) => void;
  onReset: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  validityFilter,
  setValidityFilter,
  onReset,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col md:flex-row items-end gap-4 shadow-xs">
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Field */}
        <div className="w-full space-y-1.5 text-left">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Search Driver
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or license no..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select
          label="Driver Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'Available', label: 'Available' },
            { value: 'On Trip', label: 'On Trip' },
            { value: 'Off Duty', label: 'Off Duty' },
            { value: 'Suspended', label: 'Suspended' },
          ]}
        />

        {/* Category Filter */}
        <Select
          label="License Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Categories' },
            { value: 'LMV', label: 'LMV (Light)' },
            { value: 'HMV', label: 'HMV (Heavy)' },
          ]}
        />

        {/* Validity Filter */}
        <Select
          label="License Validity"
          value={validityFilter}
          onChange={(e) => setValidityFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Validity States' },
            { value: 'Valid', label: 'Valid Only' },
            { value: 'Expiring Soon', label: 'Expiring Soon (< 30 days)' },
            { value: 'Expired', label: 'Expired Only' },
          ]}
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer w-full md:w-auto shrink-0"
      >
        Clear Filters
      </button>
    </div>
  );
};
