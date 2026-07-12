import React, { useState, useMemo } from 'react';
import { useDrivers, type Driver, getLicenseValidityState } from '../../context/DriverContext';
import { StatsCards } from './StatsCards';
import { FilterToolbar } from './FilterToolbar';
import { DriverTable } from './DriverTable';
import { DriverFormDialog } from './DriverFormDialog';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Info, Plus, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'name' | 'safetyScore' | 'licenseExpiry' | 'tripCompletionRate';
type SortOrder = 'asc' | 'desc';

export const DriversPage: React.FC = () => {
  const { drivers, deleteDriver } = useDrivers();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [validityFilter, setValidityFilter] = useState('All');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal Dialog Trigger State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (driver: Driver) => {
    setDeletingDriver(driver);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingDriver) {
      deleteDriver(deletingDriver.id);
      toast.success(`Driver profile of ${deletingDriver.name} deleted.`);
      setIsDeleteOpen(false);
      setDeletingDriver(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setValidityFilter('All');
    toast.info('Search parameters and filters reset.');
  };

  // Processed Drivers list calculation
  const processedDrivers = useMemo(() => {
    return drivers
      .filter((driver) => {
        // Search filter matching name or license
        const matchesSearch =
          driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;

        // Category filter
        const matchesCategory = categoryFilter === 'All' || driver.category === categoryFilter;

        // Validity filter
        const validityState = getLicenseValidityState(driver.licenseExpiry);
        const matchesValidity = validityFilter === 'All' || validityState === validityFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesValidity;
      })
      .sort((a, b) => {
        let fieldA = a[sortField];
        let fieldB = b[sortField];

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return sortOrder === 'asc'
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
          return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
      });
  }, [drivers, searchQuery, statusFilter, categoryFilter, validityFilter, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Drivers & Safety Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage driver profiles, licenses, safety compliance, and availability.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center space-x-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Driver</span>
        </Button>
      </div>

      {/* Quick Summary Cards */}
      <StatsCards />

      {/* Filter Options Bar */}
      <FilterToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        validityFilter={validityFilter}
        setValidityFilter={setValidityFilter}
        onReset={handleResetFilters}
      />

      {/* Driver List Table */}
      <DriverTable
        drivers={processedDrivers}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Business Safety Rules Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-start space-x-3.5 shadow-2xs">
        <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg shrink-0">
          <Info className="h-5 w-5" />
        </div>
        <div className="text-left space-y-1.5">
          <h4 className="text-sm font-bold text-slate-900">Driver Assignment Rules</h4>
          <ul className="text-xs text-slate-600 space-y-1 font-medium leading-relaxed">
            <li className="flex items-center space-x-1.5">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span>Suspended drivers cannot be assigned to trips.</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span>Drivers with expired licenses cannot be dispatched.</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span>Drivers already On Trip cannot be assigned to another trip.</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              <span>Off Duty drivers are unavailable for dispatch.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Form Validation Dialog */}
      <DriverFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingDriver={editingDriver}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-danger flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Confirm Profile Deletion</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the profile of driver <strong>{deletingDriver?.name}</strong> (License: {deletingDriver?.licenseNumber})?
            <br />
            This soft-deletes the driver asset from active lists. All history will be removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDeleteConfirm}>
            Delete Profile
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
