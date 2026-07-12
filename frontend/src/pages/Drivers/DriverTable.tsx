import React from 'react';
import { type Driver, getLicenseValidityState } from '../../context/DriverContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { SafetyScoreBadge } from './SafetyScoreBadge';
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  UserX,
  AlertTriangle
} from 'lucide-react';

interface DriverTableProps {
  drivers: Driver[];
  sortField: 'name' | 'safetyScore' | 'licenseExpiry' | 'tripCompletionRate';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'safetyScore' | 'licenseExpiry' | 'tripCompletionRate') => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}) => {

  const getDriverStatusBadge = (driver: Driver) => {
    const validity = getLicenseValidityState(driver.licenseExpiry);
    
    // If license is expired, show status badge as red-outlined
    if (validity === 'Expired') {
      return (
        <Badge variant="secondary" className="border-red-500 text-red-500 bg-red-50/50 outline-red-500">
          Expired License
        </Badge>
      );
    }

    switch (driver.status) {
      case 'Available':
        return <Badge variant="success">Available</Badge>;
      case 'On Trip':
        return <Badge variant="primary">On Trip</Badge>;
      case 'Off Duty':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Off Duty</Badge>;
      case 'Suspended':
        return <Badge variant="warning" className="bg-orange-50 text-orange-700 border-orange-200">Suspended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getLicenseValidityBadge = (expiryDate: string) => {
    const state = getLicenseValidityState(expiryDate);
    switch (state) {
      case 'Expired':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 mt-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Expired ({expiryDate})</span>
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 mt-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Expiring Soon ({expiryDate})</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-500 mt-1 block font-medium">{expiryDate}</span>;
    }
  };

  const renderSortIcon = (field: 'name' | 'safetyScore' | 'licenseExpiry' | 'tripCompletionRate') => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
    );
  };

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl">
        <div className="rounded-full bg-slate-50 p-4 text-slate-400 mb-4 border border-slate-100">
          <UserX className="h-10 w-10" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900">No drivers found</h4>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          We couldn't find any drivers matching your search filters. Try adjusting your query or resetting filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 select-none">
                <button
                  onClick={() => onSort('name')}
                  className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Driver {renderSortIcon('name')}
                </button>
              </TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="select-none">
                <button
                  onClick={() => onSort('licenseExpiry')}
                  className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                >
                  License Expiry {renderSortIcon('licenseExpiry')}
                </button>
              </TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead className="select-none">
                <button
                  onClick={() => onSort('tripCompletionRate')}
                  className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Trip Completion {renderSortIcon('tripCompletionRate')}
                </button>
              </TableHead>
              <TableHead className="select-none">
                <button
                  onClick={() => onSort('safetyScore')}
                  className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Safety Score {renderSortIcon('safetyScore')}
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id} className="hover:bg-slate-50/50">
                {/* Driver Identity */}
                <TableCell className="pl-6 py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-800 border border-slate-200 text-sm shadow-xs">
                      {driver.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate leading-none mb-1">{driver.name}</p>
                      <span className="text-xs text-slate-400 truncate block leading-none">{driver.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-700 font-semibold">{driver.licenseNumber}</TableCell>
                <TableCell>
                  <Badge variant={driver.category === 'HMV' ? 'primary' : 'secondary'} className="text-[10px]">
                    {driver.category}
                  </Badge>
                </TableCell>
                <TableCell>{getLicenseValidityBadge(driver.licenseExpiry)}</TableCell>
                <TableCell className="text-slate-600 font-medium">+91 {driver.contactNumber}</TableCell>
                <TableCell className="text-slate-800 font-semibold">{driver.tripCompletionRate}%</TableCell>
                <TableCell>
                  <SafetyScoreBadge score={driver.safetyScore} />
                </TableCell>
                <TableCell>{getDriverStatusBadge(driver)}</TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex justify-end items-center space-x-2.5">
                    <button
                      onClick={() => onEdit(driver)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit driver"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(driver)}
                      className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50/55 rounded-lg transition-colors cursor-pointer"
                      title="Delete driver"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
