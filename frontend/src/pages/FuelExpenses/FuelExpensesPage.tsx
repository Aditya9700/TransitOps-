import React, { useState, useMemo } from 'react';
import { useExpenses, type FuelLog, type Expense } from '../../context/ExpenseContext';
import { useFleet } from '../../context/FleetContext';
import { StatsCards } from './StatsCards';
import { QuickInsights } from './QuickInsights';
import { CostBreakdownBar } from './CostBreakdownBar';
import { VehicleSummaryCard } from './VehicleSummaryCard';
import { FilterToolbar } from './FilterToolbar';
import { FuelTable } from './FuelTable';
import { ExpenseTable } from './ExpenseTable';
import { FuelDialog } from './FuelDialog';
import { ExpenseDialog } from './ExpenseDialog';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Calculator, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export const FuelExpensesPage: React.FC = () => {
  const { fuelLogs, expenses, deleteFuelLog, deleteExpense } = useExpenses();
  const { vehicles } = useFleet();

  // Active Tab: 'fuel' | 'expenses'
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortField, setSortField] = useState<'cost' | 'date' | 'vehicle'>('date');

  // Dialog State
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState<FuelLog | null>(null);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Deletion warnings state
  const [deletingFuel, setDeletingFuel] = useState<FuelLog | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const handleOpenAddFuel = () => {
    setEditingFuel(null);
    setIsFuelOpen(true);
  };

  const handleOpenEditFuel = (log: FuelLog) => {
    setEditingFuel(log);
    setIsFuelOpen(true);
  };

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseOpen(true);
  };

  const handleDeleteFuelConfirm = () => {
    if (deletingFuel) {
      deleteFuelLog(deletingFuel.id);
      toast.success(`Fuel log ${deletingFuel.id} deleted successfully.`);
      setDeletingFuel(null);
    }
  };

  const handleDeleteExpenseConfirm = () => {
    if (deletingExpense) {
      deleteExpense(deletingExpense.id);
      toast.success(`Expense record ${deletingExpense.id} deleted successfully.`);
      setDeletingExpense(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedVehicleId('All');
    setSelectedCategory('All');
    setSortField('date');
  };

  // Filter & Sort Fuel Logs
  const processedFuelLogs = useMemo(() => {
    return fuelLogs
      .filter((log) => {
        const vehicle = vehicles.find((v) => v.id === log.vehicleId);

        // Search text matching
        const matchesSearch =
          log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.tripId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.fuelStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle && vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()));

        // Vehicle Filter
        const matchesVehicle = selectedVehicleId === 'All' || log.vehicleId === selectedVehicleId;

        // Category Filter (Fuel Tab matches when Fuel is chosen, or category is All)
        const matchesCategory = selectedCategory === 'All' || selectedCategory === 'Fuel';

        return matchesSearch && matchesVehicle && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === 'cost') {
          return b.fuelCost - a.fuelCost;
        } else if (sortField === 'vehicle') {
          const nameA = vehicles.find((v) => v.id === a.vehicleId)?.name || '';
          const nameB = vehicles.find((v) => v.id === b.vehicleId)?.name || '';
          return nameA.localeCompare(nameB);
        } else {
          // default date sorting: newest first
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
      });
  }, [fuelLogs, searchQuery, selectedVehicleId, selectedCategory, sortField, vehicles]);

  // Filter & Sort Expense Logs
  const processedExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const vehicle = vehicles.find((v) => v.id === exp.vehicleId);

        // Search text matching
        const matchesSearch =
          exp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.tripId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.expenseCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle && vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()));

        // Vehicle Filter
        const matchesVehicle = selectedVehicleId === 'All' || exp.vehicleId === selectedVehicleId;

        // Category Filter (Excludes Fuel tab when category filter is active unless All)
        const matchesCategory = selectedCategory === 'All' || (selectedCategory !== 'Fuel' && exp.expenseCategory === selectedCategory);

        return matchesSearch && matchesVehicle && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === 'cost') {
          return b.amount - a.amount;
        } else if (sortField === 'vehicle') {
          const nameA = vehicles.find((v) => v.id === a.vehicleId)?.name || '';
          const nameB = vehicles.find((v) => v.id === b.vehicleId)?.name || '';
          return nameA.localeCompare(nameB);
        } else {
          // default date sorting: newest first
          return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
        }
      });
  }, [expenses, searchQuery, selectedVehicleId, selectedCategory, sortField, vehicles]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 text-left">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fuel & Expense Management</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor fuel consumption, operational expenses, and vehicle running costs.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <StatsCards />

      {/* Quick Insights dashboard */}
      <QuickInsights />

      {/* Middle Analytics Section (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Vehicle operational lookup (5 cols) */}
        <div className="lg:col-span-5">
          <VehicleSummaryCard />
        </div>

        {/* Right: Cost breakdown + formula card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <CostBreakdownBar />

          {/* Formula calculation panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-start space-x-3.5 shadow-2xs text-left">
            <div className="p-1.5 bg-blue-50 text-primary rounded-lg shrink-0">
              <Calculator className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 font-medium">
              <h4 className="text-sm font-bold text-slate-950">Operational Formulations</h4>
              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  1. <strong className="text-slate-900">Running Cost</strong> = Fuel Cost + Maintenance Cost + Other Expenses
                </p>
                <p>
                  2. <strong className="text-slate-900">Fuel Efficiency (Mileage)</strong> = Distance / Fuel Consumed (L)
                </p>
                <p>
                  3. <strong className="text-slate-900">Vehicle ROI</strong> = Revenue − Operational Costs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced filters and lists toolbar */}
      <FilterToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedVehicleId={selectedVehicleId}
        setSelectedVehicleId={setSelectedVehicleId}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortField={sortField}
        setSortField={setSortField}
        onLogFuelClick={handleOpenAddFuel}
        onAddExpenseClick={handleOpenAddExpense}
        onReset={handleResetFilters}
      />

      {/* Dual Tab listings */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('fuel')}
            className={`py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === 'fuel'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Fuel refuel logs ({processedFuelLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === 'expenses'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Operational expenses ({processedExpenses.length})
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'fuel' ? (
          <FuelTable
            logs={processedFuelLogs}
            onEdit={handleOpenEditFuel}
            onDelete={setDeletingFuel}
          />
        ) : (
          <ExpenseTable
            expenses={processedExpenses}
            onEdit={handleOpenEditExpense}
            onDelete={setDeletingExpense}
          />
        )}
      </div>

      {/* Fuel dialog */}
      <FuelDialog
        isOpen={isFuelOpen}
        onClose={() => setIsFuelOpen(false)}
        editingLog={editingFuel}
      />

      {/* Expense dialog */}
      <ExpenseDialog
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        editingExpense={editingExpense}
      />

      {/* Fuel delete confirmation */}
      <Dialog isOpen={!!deletingFuel} onClose={() => setDeletingFuel(null)}>
        <DialogHeader>
          <DialogTitle className="text-danger flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Confirm Deletion</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete fuel log <strong>{deletingFuel?.id}</strong> at {deletingFuel?.fuelStation}?
            <br />
            This will permanently remove the record from cost estimations.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDeletingFuel(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDeleteFuelConfirm}>
            Delete Refuel Log
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Expense delete confirmation */}
      <Dialog isOpen={!!deletingExpense} onClose={() => setDeletingExpense(null)}>
        <DialogHeader>
          <DialogTitle className="text-danger flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Confirm Deletion</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete expense record <strong>{deletingExpense?.id}</strong> for {deletingExpense?.description}?
            <br />
            This will permanently remove this operational expense log.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDeletingExpense(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDeleteExpenseConfirm}>
            Delete Expense Log
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
