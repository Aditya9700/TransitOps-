import React from 'react';
import { type Expense } from '../../context/ExpenseContext';
import { useFleet } from '../../context/FleetContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Edit2, Trash2, CreditCard } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const { vehicles } = useFleet();

  const getStatusBadge = (status: Expense['status']) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success">Paid</Badge>;
      case 'Pending':
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-250">Pending</Badge>;
      case 'Rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: Expense['expenseCategory']) => {
    switch (category) {
      case 'Toll':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Toll</Badge>;
      case 'Parking':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Parking</Badge>;
      case 'Repair':
        return <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Repair</Badge>;
      case 'Cleaning':
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-250">Cleaning</Badge>;
      case 'Maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      default:
        return <Badge variant="primary">{category}</Badge>;
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl">
        <div className="rounded-full bg-slate-50 p-4 text-slate-400 mb-4 border border-slate-100">
          <CreditCard className="h-10 w-10" />
        </div>
        <h4 className="text-lg font-semibold text-slate-900">No expense records found</h4>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          Try resetting filters or adding a new operational expense.
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
              <TableHead className="pl-6">Trip ID</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const vehicle = vehicles.find((v) => v.id === expense.vehicleId);

              return (
                <TableRow key={expense.id} className="hover:bg-slate-50/50">
                  {/* Trip ID */}
                  <TableCell className="pl-6 py-3.5 font-semibold text-slate-700">{expense.tripId}</TableCell>

                  {/* Vehicle */}
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate mb-0.5">
                        {vehicle ? vehicle.name : 'Unknown'}
                      </p>
                      <span className="text-xs text-slate-400 font-mono">
                        {vehicle ? vehicle.registrationNumber : '—'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>{getCategoryBadge(expense.expenseCategory)}</TableCell>

                  {/* Description */}
                  <TableCell className="text-slate-700 font-medium">{expense.description}</TableCell>

                  {/* Amount */}
                  <TableCell className="text-slate-850 font-bold">₹{expense.amount.toLocaleString()}</TableCell>

                  {/* Date */}
                  <TableCell className="text-slate-600 font-medium">{expense.expenseDate}</TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>

                  {/* Actions */}
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end items-center space-x-2.5">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit expense record"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(expense)}
                        className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete expense"
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
