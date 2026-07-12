import React, { useState, useMemo } from 'react';
import { useMaintenance, type MaintenanceRecord } from '../../context/MaintenanceContext';
import { useFleet } from '../../context/FleetContext';
import { StatsCards } from './StatsCards';
import { CostSummaryCard } from './CostSummaryCard';
import { FilterToolbar } from './FilterToolbar';
import { MaintenanceForm } from './MaintenanceForm';
import { MaintenanceTable } from './MaintenanceTable';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { 
  Info, 
  Wrench, 
  User, 
  Calendar, 
  ShieldAlert,
  Play,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export const MaintenancePage: React.FC = () => {
  const { records, deleteRecord, markActive, markCompleted } = useMaintenance();
  const { vehicles } = useFleet();

  // Search, filter, and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [sortField, setSortField] = useState<'scheduledDate' | 'estimatedCost' | 'vehicleId' | 'status'>('scheduledDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MaintenanceRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MaintenanceRecord | null>(null);

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
  };

  const handleMarkActive = (id: string) => {
    const res = markActive(id);
    if (res.success) {
      toast.success('Vehicle moved to maintenance. Vehicle unavailable for dispatch.');
    } else {
      toast.error(res.error || 'Failed to start maintenance.');
    }
  };

  const handleMarkCompleted = (id: string) => {
    const res = markCompleted(id);
    if (res.success) {
      toast.success('Vehicle maintenance completed. Vehicle returned to Available.');
    } else {
      toast.error(res.error || 'Failed to complete maintenance.');
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingRecord) {
      const res = deleteRecord(deletingRecord.id);
      if (res.success) {
        toast.success(`Maintenance record ${deletingRecord.id} deleted successfully.`);
        setDeletingRecord(null);
      } else {
        toast.error(res.error || 'Failed to delete record.');
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setTypeFilter('All');
    setSortField('scheduledDate');
    setSortOrder('desc');
  };

  // Processed maintenance records listing calculation
  const processedRecords = useMemo(() => {
    return records
      .filter((record) => {
        const vehicle = vehicles.find((v) => v.id === record.vehicleId);

        // Search match
        const matchesSearch =
          record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.mechanicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle && vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (vehicle && vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter status
        const matchesStatus = statusFilter === 'All' || record.status === statusFilter;

        // Filter priority
        const matchesPriority = priorityFilter === 'All' || record.priority === priorityFilter;

        // Filter vehicle type
        const matchesType = typeFilter === 'All' || (vehicle && vehicle.type === typeFilter);

        return matchesSearch && matchesStatus && matchesPriority && matchesType;
      })
      .sort((a, b) => {
        let fieldA = a[sortField];
        let fieldB = b[sortField];

        if (sortField === 'vehicleId') {
          const vehicleA = vehicles.find((v) => v.id === a.vehicleId)?.name || '';
          const vehicleB = vehicles.find((v) => v.id === b.vehicleId)?.name || '';
          fieldA = vehicleA;
          fieldB = vehicleB;
        }

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return sortOrder === 'asc'
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
          return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
      });
  }, [records, searchQuery, statusFilter, priorityFilter, typeFilter, sortField, sortOrder, vehicles]);

  // Priority details mapping
  const getPriorityBadge = (priority?: MaintenanceRecord['priority']) => {
    if (!priority) return null;
    switch (priority) {
      case 'Low':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
      case 'Medium':
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-250">Medium</Badge>;
      case 'High':
        return <Badge variant="warning" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
      case 'Critical':
        return <Badge variant="danger" className="bg-red-50 text-red-700 border-red-200 animate-pulse">Critical</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status?: MaintenanceRecord['status']) => {
    if (!status) return null;
    switch (status) {
      case 'Scheduled':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Scheduled</Badge>;
      case 'Active':
        return <Badge variant="warning" className="bg-orange-50 text-orange-700 border-orange-200">Active (In Shop)</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const viewingVehicle = viewingRecord ? vehicles.find((v) => v.id === viewingRecord.vehicleId) : null;

  // Horizontal step timelines coordinates
  const steps = viewingRecord ? [
    { label: 'Scheduled', active: true, date: viewingRecord.scheduledDate },
    { 
      label: 'Started (In Shop)', 
      active: viewingRecord.status === 'Active' || viewingRecord.status === 'Completed', 
      date: viewingRecord.status === 'Active' || viewingRecord.status === 'Completed' ? viewingRecord.scheduledDate : undefined
    },
    { 
      label: viewingRecord.status === 'Cancelled' ? 'Cancelled' : 'Completed', 
      active: viewingRecord.status === 'Completed' || viewingRecord.status === 'Cancelled', 
      date: viewingRecord.status === 'Completed' ? viewingRecord.completionDate : viewingRecord.status === 'Cancelled' ? viewingRecord.scheduledDate : undefined
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 text-left">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Maintenance</h2>
          <p className="text-sm text-slate-500 mt-1">Track service records, maintenance schedules, repair history, and vehicle availability.</p>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <StatsCards />

      {/* Split views block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left pane: Form, Cost Analytics and Business Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <MaintenanceForm 
            editingRecord={editingRecord}
            onCancelEdit={handleCancelEdit}
          />

          <CostSummaryCard />

          {/* Business rules panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-start space-x-3.5 shadow-2xs text-left">
            <div className="p-1.5 bg-blue-50 text-primary rounded-lg shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 font-medium">
              <h4 className="text-sm font-bold text-slate-950">Maintenance Rules</h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-3 leading-relaxed">
                <li>Vehicles in Active Maintenance automatically become **In Shop**.</li>
                <li>**In Shop** vehicles cannot be selected in Trip Dispatcher.</li>
                <li>Completing maintenance restores vehicle status to **Available**.</li>
                <li>Retired vehicles remain **Retired** after maintenance.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right pane: Table listings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <FilterToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onReset={handleResetFilters}
          />

          <MaintenanceTable
            records={processedRecords}
            onView={setViewingRecord}
            onEdit={handleEdit}
            onDelete={setDeletingRecord}
            onMarkActive={handleMarkActive}
            onMarkCompleted={handleMarkCompleted}
          />
        </div>
      </div>

      {/* View Details Dialog Modal */}
      <Dialog isOpen={!!viewingRecord} onClose={() => setViewingRecord(null)}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-slate-500" />
            <span>Job Log Details: {viewingRecord?.id}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed specifications of the scheduled or completed servicing order.
          </DialogDescription>
        </DialogHeader>

        {viewingRecord && (
          <div className="space-y-5 text-left text-xs font-semibold text-slate-600">
            {/* Horizontal Stepper timeline */}
            <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
              {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                      step.active
                        ? viewingRecord.status === 'Cancelled' && idx === 2
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-primary bg-blue-50 text-primary'
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                    }`}>
                      {idx === 0 ? <Calendar className="h-3 w-3" /> : idx === 1 ? <Play className="h-3 w-3" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-[10px] mt-1 text-slate-800 font-bold truncate max-w-full">{step.label}</span>
                    {step.date && <span className="text-[9px] text-slate-400 font-medium mt-0.5">{step.date}</span>}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-4 border-t border-dashed ${
                      steps[idx + 1].active ? 'border-primary' : 'border-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Vehicle Card */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-1">Vehicle Asset</span>
                <span className="text-sm font-bold text-slate-900 block">{viewingVehicle?.name}</span>
                <span className="text-xs font-mono text-slate-400 font-semibold">{viewingVehicle?.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-1">Odometer Log</span>
                <span className="text-sm font-bold text-slate-900 block">{viewingVehicle?.odometer.toLocaleString()} km</span>
              </div>
            </div>

            {/* Service & Category details */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-1">Service Type</span>
                <span className="text-slate-900 block font-bold text-sm">{viewingRecord.serviceType}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">{viewingRecord.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-1">Cost Allocation</span>
                <span className="text-sm font-bold text-slate-900 block">₹{viewingRecord.estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Mechanic & Date details */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <User className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-0.5">Assigned Mechanic</span>
                  <span className="text-slate-900 font-bold">{viewingRecord.mechanicName}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-1">Date Logged</span>
                <span className="text-slate-900 font-bold flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{viewingRecord.scheduledDate}</span>
                </span>
              </div>
            </div>

            {/* Severity Pill badges */}
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-1">Priority</span>
                {getPriorityBadge(viewingRecord.priority)}
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider mb-1">Status</span>
                {getStatusBadge(viewingRecord.status)}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-slate-400 block uppercase text-[9px] tracking-wider">Servicing Description</span>
              <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-150 leading-relaxed font-semibold">
                {viewingRecord.description}
              </p>
            </div>

            {/* Notes */}
            {viewingRecord.notes && (
              <div className="space-y-1">
                <span className="text-slate-400 block uppercase text-[9px] tracking-wider">Notes</span>
                <p className="text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-medium">
                  "{viewingRecord.notes}"
                </p>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" onClick={() => setViewingRecord(null)}>
                Close Log
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={!!deletingRecord} onClose={() => setDeletingRecord(null)}>
        <DialogHeader>
          <DialogTitle className="text-danger flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Confirm Deletion</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete maintenance record <strong>{deletingRecord?.id}</strong> for {deletingRecord?.serviceType}?
            <br />
            This will permanently remove the record from active lists.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDeletingRecord(null)}>
            Cancel Action
          </Button>
          <Button type="button" variant="danger" onClick={handleDeleteConfirm}>
            Delete Log
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
