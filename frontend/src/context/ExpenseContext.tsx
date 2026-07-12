import React, { createContext, useContext, useState, useEffect } from 'react';

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId: string;
  driverId: string;
  date: string;
  fuelQuantity: number; // in Liters
  fuelCost: number; // in ₹ Rupees
  odometer: number;
  fuelStation: string;
  notes?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  vehicleId: string;
  expenseCategory: 'Toll' | 'Maintenance' | 'Parking' | 'Repair' | 'Cleaning' | 'Insurance' | 'Miscellaneous';
  amount: number; // in ₹ Rupees
  expenseDate: string;
  description: string;
  status: 'Paid' | 'Pending' | 'Rejected';
}

interface ExpenseContextType {
  fuelLogs: FuelLog[];
  expenses: Expense[];
  addFuelLog: (log: Omit<FuelLog, 'id'>) => { success: boolean; logId?: string; error?: string };
  updateFuelLog: (id: string, updated: Omit<FuelLog, 'id'>) => { success: boolean; error?: string };
  deleteFuelLog: (id: string) => { success: boolean; error?: string };
  addExpense: (expense: Omit<Expense, 'id'>) => { success: boolean; expenseId?: string; error?: string };
  updateExpense: (id: string, updated: Omit<Expense, 'id'>) => { success: boolean; error?: string };
  deleteExpense: (id: string) => { success: boolean; error?: string };
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// 20 Relational Fuel Logs
const SEED_FUEL: FuelLog[] = [
  { id: 'FL001', vehicleId: '1', tripId: 'TR001', driverId: 'd1', date: '2026-07-01', fuelQuantity: 42, fuelCost: 3550, odometer: 74200, fuelStation: 'HP Petrol Pump, Ahmedabad', notes: 'Full tank refuel' },
  { id: 'FL002', vehicleId: '2', tripId: 'TR002', driverId: 'd3', date: '2026-07-11', fuelQuantity: 110, fuelCost: 8400, odometer: 120150, fuelStation: 'IndianOil Express, Delhi' },
  { id: 'FL003', vehicleId: '5', tripId: 'TR003', driverId: 'd8', date: '2026-07-11', fuelQuantity: 28, fuelCost: 2050, odometer: 34500, fuelStation: 'Bharat Petroleum, Pune' },
  { id: 'FL004', vehicleId: '6', tripId: 'TR005', driverId: 'd5', date: '2026-07-05', fuelQuantity: 85, fuelCost: 7100, odometer: 12100, fuelStation: 'Shell Station, Indore' },
  { id: 'FL005', vehicleId: '7', tripId: 'TR006', driverId: 'd12', date: '2026-07-11', fuelQuantity: 150, fuelCost: 14200, odometer: 62200, fuelStation: 'HP Petrol, Mumbai' },
  { id: 'FL006', vehicleId: '2', tripId: 'TR008', driverId: 'd3', date: '2026-07-04', fuelQuantity: 95, fuelCost: 8100, odometer: 120400, fuelStation: 'IndianOil, Lucknow' },
  { id: 'FL007', vehicleId: '1', tripId: 'TR010', driverId: 'd1', date: '2026-07-08', fuelQuantity: 30, fuelCost: 2600, odometer: 74050, fuelStation: 'Bharat Petroleum, Mumbai' },
  { id: 'FL008', vehicleId: '6', tripId: 'TR012', driverId: 'd11', date: '2026-07-07', fuelQuantity: 25, fuelCost: 2150, odometer: 12050, fuelStation: 'Shell Fuel, Pune' },
  { id: 'FL009', vehicleId: '7', tripId: 'TR013', driverId: 'd12', date: '2026-07-05', fuelQuantity: 180, fuelCost: 17100, odometer: 61800, fuelStation: 'HP Highway Hub, Lucknow' },
  { id: 'FL010', vehicleId: '2', tripId: 'TR014', driverId: 'd8', date: '2026-07-06', fuelQuantity: 90, fuelCost: 7650, odometer: 120900, fuelStation: 'IndianOil Petrol, Indore' },
  { id: 'FL011', vehicleId: '11', tripId: 'TR015', driverId: 'd10', date: '2026-07-02', fuelQuantity: 140, fuelCost: 12600, odometer: 32100, fuelStation: 'BPCL Depot, Delhi' },
  { id: 'FL012', vehicleId: '1', tripId: 'TR001', driverId: 'd1', date: '2026-07-02', fuelQuantity: 38, fuelCost: 3200, odometer: 74500, fuelStation: 'IndianOil, Surat' },
  { id: 'FL013', vehicleId: '2', tripId: 'TR002', driverId: 'd3', date: '2026-07-11', fuelQuantity: 80, fuelCost: 6800, odometer: 120250, fuelStation: 'HP Station, Gurgaon' },
  { id: 'FL014', vehicleId: '5', tripId: 'TR003', driverId: 'd8', date: '2026-07-11', fuelQuantity: 70, fuelCost: 5950, odometer: 34700, fuelStation: 'BP Highway, Kalyan' },
  { id: 'FL015', vehicleId: '6', tripId: 'TR005', driverId: 'd5', date: '2026-07-06', fuelQuantity: 65, fuelCost: 5500, odometer: 12500, fuelStation: 'IndianOil, Shirpur' },
  { id: 'FL016', vehicleId: '7', tripId: 'TR006', driverId: 'd12', date: '2026-07-11', fuelQuantity: 120, fuelCost: 10200, odometer: 62450, fuelStation: 'BPCL, Silvassa' },
  { id: 'FL017', vehicleId: '2', tripId: 'TR008', driverId: 'd3', date: '2026-07-05', fuelQuantity: 70, fuelCost: 5950, odometer: 120550, fuelStation: 'HP Express, Kanpur' },
  { id: 'FL018', vehicleId: '7', tripId: 'TR013', driverId: 'd12', date: '2026-07-06', fuelQuantity: 150, fuelCost: 12750, odometer: 62800, fuelStation: 'BP Depot, Surat' },
  { id: 'FL019', vehicleId: '2', tripId: 'TR014', driverId: 'd8', date: '2026-07-07', fuelQuantity: 85, fuelCost: 7200, odometer: 121150, fuelStation: 'Shell Fuel, Jaipur' },
  { id: 'FL020', vehicleId: '11', tripId: 'TR015', driverId: 'd10', date: '2026-07-03', fuelQuantity: 130, fuelCost: 11050, odometer: 32300, fuelStation: 'Reliance Pumps, Udaipur' },
];

// 20 Relational Operational Expenses
const SEED_EXPENSES: Expense[] = [
  { id: 'EXP001', tripId: 'TR001', vehicleId: '1', expenseCategory: 'Toll', amount: 850, expenseDate: '2026-07-01', description: 'NH48 Toll Plaza taxes', status: 'Paid' },
  { id: 'EXP002', tripId: 'TR001', vehicleId: '1', expenseCategory: 'Parking', amount: 150, expenseDate: '2026-07-02', description: 'Parking charges at warehouse loading dock', status: 'Paid' },
  { id: 'EXP003', tripId: 'TR002', vehicleId: '2', expenseCategory: 'Toll', amount: 620, expenseDate: '2026-07-11', description: 'Delhi-Jaipur expressway tolls', status: 'Paid' },
  { id: 'EXP004', tripId: 'TR003', vehicleId: '5', expenseCategory: 'Toll', amount: 980, expenseDate: '2026-07-11', description: 'Mumbai-Pune Expressway toll checks', status: 'Paid' },
  { id: 'EXP005', tripId: 'TR003', vehicleId: '5', expenseCategory: 'Parking', amount: 200, expenseDate: '2026-07-11', description: 'Night parking charges in Surat hub', status: 'Pending' },
  { id: 'EXP006', tripId: 'TR005', vehicleId: '6', expenseCategory: 'Toll', amount: 480, expenseDate: '2026-07-05', description: 'Indore highway toll points', status: 'Paid' },
  { id: 'EXP007', tripId: 'TR006', vehicleId: '7', expenseCategory: 'Toll', amount: 2400, expenseDate: '2026-07-11', description: 'Heavy vehicle interstate tolls', status: 'Paid' },
  { id: 'EXP008', tripId: 'TR007', vehicleId: '11', expenseCategory: 'Toll', amount: 350, expenseDate: '2026-07-08', description: 'Surat bypass tolls', status: 'Rejected' },
  { id: 'EXP009', tripId: 'TR008', vehicleId: '2', expenseCategory: 'Toll', amount: 1200, expenseDate: '2026-07-04', description: 'Yamuna Expressway heavy tolls', status: 'Paid' },
  { id: 'EXP010', tripId: 'TR008', vehicleId: '2', expenseCategory: 'Cleaning', amount: 400, expenseDate: '2026-07-05', description: 'Post-delivery cabin wash and vacuum', status: 'Paid' },
  { id: 'EXP011', tripId: 'TR010', vehicleId: '1', expenseCategory: 'Toll', amount: 180, expenseDate: '2026-07-08', description: 'Vashi toll plaza charge', status: 'Paid' },
  { id: 'EXP012', tripId: 'TR012', vehicleId: '6', expenseCategory: 'Toll', amount: 180, expenseDate: '2026-07-07', description: 'Pune bypass toll fee', status: 'Paid' },
  { id: 'EXP013', tripId: 'TR013', vehicleId: '7', expenseCategory: 'Toll', amount: 3800, expenseDate: '2026-07-06', description: 'Multiple border cross levies', status: 'Paid' },
  { id: 'EXP014', tripId: 'TR013', vehicleId: '7', expenseCategory: 'Miscellaneous', amount: 500, expenseDate: '2026-07-06', description: 'Weighbridge check scale fee', status: 'Paid' },
  { id: 'EXP015', tripId: 'TR014', vehicleId: '2', expenseCategory: 'Toll', amount: 1100, expenseDate: '2026-07-06', description: 'Indore-Jaipur highway tolls', status: 'Paid' },
  { id: 'EXP016', tripId: 'TR015', vehicleId: '11', expenseCategory: 'Toll', amount: 2100, expenseDate: '2026-07-03', description: 'State tax border entry tickets', status: 'Paid' },
  { id: 'EXP017', tripId: 'TR001', vehicleId: '1', expenseCategory: 'Repair', amount: 18000, expenseDate: '2026-07-02', description: 'Radiator fan repair clamp replacement', status: 'Paid' },
  { id: 'EXP018', tripId: 'TR002', vehicleId: '2', expenseCategory: 'Miscellaneous', amount: 300, expenseDate: '2026-07-11', description: 'Driver meals pocket allowanced', status: 'Pending' },
  { id: 'EXP019', tripId: 'TR003', vehicleId: '5', expenseCategory: 'Toll', amount: 800, expenseDate: '2026-07-11', description: 'Lonavala exit tolls', status: 'Paid' },
  { id: 'EXP020', tripId: 'TR006', vehicleId: '7', expenseCategory: 'Toll', amount: 1500, expenseDate: '2026-07-11', description: 'Ghodbunder toll tax points', status: 'Paid' },
];

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const storedFuel = localStorage.getItem('transitops_fuel_logs');
    const storedExpenses = localStorage.getItem('transitops_expenses');

    if (storedFuel) {
      try {
        setFuelLogs(JSON.parse(storedFuel));
      } catch (e) {
        setFuelLogs(SEED_FUEL);
      }
    } else {
      setFuelLogs(SEED_FUEL);
      localStorage.setItem('transitops_fuel_logs', JSON.stringify(SEED_FUEL));
    }

    if (storedExpenses) {
      try {
        setExpenses(JSON.parse(storedExpenses));
      } catch (e) {
        setExpenses(SEED_EXPENSES);
      }
    } else {
      setExpenses(SEED_EXPENSES);
      localStorage.setItem('transitops_expenses', JSON.stringify(SEED_EXPENSES));
    }
  }, []);

  const saveFuel = (logs: FuelLog[]) => {
    setFuelLogs(logs);
    localStorage.setItem('transitops_fuel_logs', JSON.stringify(logs));
  };

  const saveExpenses = (exps: Expense[]) => {
    setExpenses(exps);
    localStorage.setItem('transitops_expenses', JSON.stringify(exps));
  };

  const addFuelLog = (logData: Omit<FuelLog, 'id'>) => {
    const latestNum = fuelLogs
      .map((fl) => parseInt(fl.id.replace('FL', '')))
      .reduce((max, num) => (num > max ? num : max), 20);

    const newId = `FL${String(latestNum + 1).padStart(3, '0')}`;
    const newLog: FuelLog = { ...logData, id: newId };

    saveFuel([...fuelLogs, newLog]);
    return { success: true, logId: newId };
  };

  const updateFuelLog = (id: string, updated: Omit<FuelLog, 'id'>) => {
    const newLogs = fuelLogs.map((l) => (l.id === id ? { ...updated, id } : l));
    saveFuel(newLogs);
    return { success: true };
  };

  const deleteFuelLog = (id: string) => {
    const newLogs = fuelLogs.filter((l) => l.id !== id);
    saveFuel(newLogs);
    return { success: true };
  };

  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const latestNum = expenses
      .map((ex) => parseInt(ex.id.replace('EXP', '')))
      .reduce((max, num) => (num > max ? num : max), 20);

    const newId = `EXP${String(latestNum + 1).padStart(3, '0')}`;
    const newExp: Expense = { ...expData, id: newId };

    saveExpenses([...expenses, newExp]);
    return { success: true, expenseId: newId };
  };

  const updateExpense = (id: string, updated: Omit<Expense, 'id'>) => {
    const newExps = expenses.map((e) => (e.id === id ? { ...updated, id } : e));
    saveExpenses(newExps);
    return { success: true };
  };

  const deleteExpense = (id: string) => {
    const newExps = expenses.filter((e) => e.id !== id);
    saveExpenses(newExps);
    return { success: true };
  };

  return (
    <ExpenseContext.Provider
      value={{
        fuelLogs,
        expenses,
        addFuelLog,
        updateFuelLog,
        deleteFuelLog,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
