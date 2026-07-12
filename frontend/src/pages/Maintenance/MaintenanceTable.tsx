import React from 'react';
import { type MaintenanceRecord } from '../../context/MaintenanceContext';
import { useFleet } from '../../context/FleetContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Edit2, Trash2, Eye, Play, CheckCircle, Wrench } from 'lucide-react';

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
  onView: (record: MaintenanceRecord) => void;
  onEdit: (record: MaintenanceRecord) => void;
  onDelete: (record: MaintenanceRecord) => void;
  onMarkActive: (id: string) => void;
  onMarkCompleted: (id: string) => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  records,
  onView,
  onEdit,
  onDelete,
  onMarkActive,
  onMarkCompleted,
}) => {
  const { vehicles } = useFleet();

  const getPriorityBadge = (priority: MaintenanceRecord['priority']) => {
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

  const getStatusBadge = (status: MaintenanceRecord['status']) => {
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

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl">
        <div className="rounded-full bg-slate-50 p-4 text-slate-400 mb-4 border border-slate-100">
          <Wrench className="h-10 w-10" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900">No maintenance records found</h4>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          We couldn't find any maintenance records matching your filters. Adjust your search or reset queries.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Vehicle</TableHead>
              <TableHead>Service / Category</TableHead>
              <TableHead>Mechanic</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const vehicle = vehicles.find((v) => v.id === record.vehicleId);
              return (
                <TableRow key={record.id} className="hover:bg-slate-50/50">
                  {/* Vehicle */}
                  <TableCell className="pl-6 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate mb-0.5">
                        {vehicle ? vehicle.name : 'Unknown'}
                      </p>
                      <span className="text-xs text-slate-400 font-mono">
                        {vehicle ? vehicle.registrationNumber : '—'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Service type / Category */}
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate mb-0.5">
                        {record.serviceType}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {record.category}
                      </span>
                    </div>
                  </TableCell>

                  {/* Mechanic */}
                  <TableCell className="text-slate-700 font-medium">{record.mechanicName}</TableCell>

                  {/* Cost */}
                  <TableCell className="text-slate-800 font-semibold">
                    ₹{record.estimatedCost.toLocaleString()}
                  </TableCell>

                  {/* Dates */}
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <div>
                        <span className="text-slate-400 mr-1.5">Scheduled:</span>
                        <span className="text-slate-700 font-semibold">{record.scheduledDate}</span>
                      </div>
                      {record.status === 'Completed' ? (
                        <div>
                          <span className="text-slate-400 mr-1.5">Done:</span>
                          <span className="text-emerald-600 font-semibold">{record.completionDate || '—'}</span>
                        </div>
                      ) : record.estimatedCompletion ? (
                        <div>
                          <span className="text-slate-400 mr-1.5">Est. End:</span>
                          <span className="text-slate-700 font-semibold">{record.estimatedCompletion}</span>
                        </div>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>{getPriorityBadge(record.priority)}</TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(record.status)}</TableCell>

                  {/* Actions */}
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end items-center space-x-2.5">
                      {/* View details */}
                      <button
                        onClick={() => onView(record)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(record)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit record"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* State modifications shortcuts */}
                      {record.status === 'Scheduled' && (
                        <button
                          onClick={() => onMarkActive(record.id)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50/50 rounded-lg transition-colors cursor-pointer"
                          title="Start Maintenance (Move In Shop)"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}

                      {record.status === 'Active' && (
                        <button
                          onClick={() => onMarkCompleted(record.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-colors cursor-pointer"
                          title="Complete Maintenance (Set Available)"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(record)}
                        className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
