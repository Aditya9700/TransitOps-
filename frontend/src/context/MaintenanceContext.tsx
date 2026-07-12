import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFleet } from './FleetContext';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  category: 'Oil Change' | 'Engine Repair' | 'Tyre Replacement' | 'Brake Service' | 'Battery' | 'General Inspection';
  scheduledDate: string;
  estimatedCompletion?: string;
  completionDate?: string;
  estimatedCost: number; // in ₹ Rupees
  mechanicName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
  notes?: string;
}

interface MaintenanceContextType {
  records: MaintenanceRecord[];
  addRecord: (record: Omit<MaintenanceRecord, 'id'>) => { success: boolean; recordId?: string; error?: string };
  updateRecord: (id: string, updated: Omit<MaintenanceRecord, 'id'>) => { success: boolean; error?: string };
  deleteRecord: (id: string) => { success: boolean; error?: string };
  markActive: (id: string) => { success: boolean; error?: string };
  markCompleted: (id: string) => { success: boolean; error?: string };
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

// 15 Relational records
const SEED_RECORDS: MaintenanceRecord[] = [
  { id: 'MNT001', vehicleId: '1', serviceType: 'Routine Oil Lubrication', description: 'Engine oil change and filter replacement', category: 'Oil Change', scheduledDate: '2026-06-15', completionDate: '2026-06-15', estimatedCost: 2500, mechanicName: 'Ramesh Sharma', priority: 'Low', status: 'Completed', notes: 'Completed during scheduled checkup.' },
  { id: 'MNT002', vehicleId: '2', serviceType: 'Piston Ring Overhaul', description: 'Engine cylinder head and piston valve gasket replacement', category: 'Engine Repair', scheduledDate: '2026-07-02', completionDate: '2026-07-05', estimatedCost: 18000, mechanicName: 'Sanjay Kumar', priority: 'Critical', status: 'Completed', notes: 'Vehicle performance restored.' },
  { id: 'MNT003', vehicleId: '3', serviceType: 'Front Wheel Re-alignment', description: 'All-season tyres replacement and alignment adjustment', category: 'Tyre Replacement', scheduledDate: '2026-07-10', estimatedCompletion: '2026-07-13', estimatedCost: 6200, mechanicName: 'Vikas Yadav', priority: 'Medium', status: 'Active', notes: 'Tyres worn out beyond limits.' },
  { id: 'MNT004', vehicleId: '5', serviceType: 'Disc Brake Replacement', description: 'Brake pads replacement and rotor machining', category: 'Brake Service', scheduledDate: '2026-07-11', estimatedCompletion: '2026-07-13', estimatedCost: 4500, mechanicName: 'Amit Patel', priority: 'High', status: 'Active' },
  { id: 'MNT005', vehicleId: '6', serviceType: 'Lead-Acid Battery Swap', description: 'Exide 12V automotive battery replacement', category: 'Battery', scheduledDate: '2026-07-08', completionDate: '2026-07-08', estimatedCost: 5500, mechanicName: 'Ramesh Sharma', priority: 'Medium', status: 'Completed' },
  { id: 'MNT006', vehicleId: '8', serviceType: 'Annual Safety Scan', description: 'General engine diagnostics, suspension check, and road tests', category: 'General Inspection', scheduledDate: '2026-07-14', estimatedCost: 1500, mechanicName: 'Sanjay Kumar', priority: 'Low', status: 'Scheduled' },
  { id: 'MNT007', vehicleId: '9', serviceType: 'Cooling Radiator Flush', description: 'Coolant leak seal and complete radiator flush', category: 'Engine Repair', scheduledDate: '2026-07-15', estimatedCost: 8000, mechanicName: 'Amit Patel', priority: 'High', status: 'Scheduled' },
  { id: 'MNT008', vehicleId: '1', serviceType: 'Rear Tyres Replacement', description: 'Swap rear tires for wet terrain control', category: 'Tyre Replacement', scheduledDate: '2026-06-20', completionDate: '2026-06-20', estimatedCost: 6500, mechanicName: 'Vikas Yadav', priority: 'Medium', status: 'Completed' },
  { id: 'MNT009', vehicleId: '10', serviceType: 'Alternator Diagnostic', description: 'Alternator brush repair and charging circuit check', category: 'General Inspection', scheduledDate: '2026-07-01', completionDate: '2026-07-02', estimatedCost: 3200, mechanicName: 'Amit Patel', priority: 'Medium', status: 'Completed' },
  { id: 'MNT010', vehicleId: '11', serviceType: 'Brake Fluids Top-up', description: 'Bleed brake lines and fill Dot-4 fluid', category: 'Brake Service', scheduledDate: '2026-06-10', completionDate: '2026-06-10', estimatedCost: 1200, mechanicName: 'Ramesh Sharma', priority: 'Low', status: 'Completed' },
  { id: 'MNT011', vehicleId: '4', serviceType: 'Cabin AC Filter Service', description: 'AC gas top-up and filter replacement', category: 'General Inspection', scheduledDate: '2026-07-12', estimatedCompletion: '2026-07-13', estimatedCost: 2000, mechanicName: 'Sanjay Kumar', priority: 'Low', status: 'Active' },
  { id: 'MNT012', vehicleId: '7', serviceType: 'Trailer Axle Grease', description: 'Heavy axle hub lubrication and leaf spring inspection', category: 'General Inspection', scheduledDate: '2026-07-16', estimatedCost: 5000, mechanicName: 'Vikas Yadav', priority: 'Medium', status: 'Scheduled' },
  { id: 'MNT013', vehicleId: '2', serviceType: 'Fuel Injectors Cleaning', description: 'Injectors cleaning and fuel line inspection', category: 'Engine Repair', scheduledDate: '2026-06-28', completionDate: '2026-06-30', estimatedCost: 7500, mechanicName: 'Amit Patel', priority: 'High', status: 'Completed' },
  { id: 'MNT014', vehicleId: '6', serviceType: 'Clutch Assembly Overhaul', description: 'Clutch plate and release bearing swap', category: 'Engine Repair', scheduledDate: '2026-07-09', completionDate: '2026-07-11', estimatedCost: 14000, mechanicName: 'Sanjay Kumar', priority: 'Critical', status: 'Completed' },
  { id: 'MNT015', vehicleId: '11', serviceType: 'Headlight Relay Replace', description: 'Swapped warning harness and high beam bulb', category: 'General Inspection', scheduledDate: '2026-07-05', completionDate: '2026-07-05', estimatedCost: 900, mechanicName: 'Ramesh Sharma', priority: 'Low', status: 'Completed' },
];

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vehicles, updateVehicle } = useFleet();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('transitops_maintenance');
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (e) {
        setRecords(SEED_RECORDS);
      }
    } else {
      setRecords(SEED_RECORDS);
      localStorage.setItem('transitops_maintenance', JSON.stringify(SEED_RECORDS));
    }
  }, []);

  const saveRecords = (newRecords: MaintenanceRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('transitops_maintenance', JSON.stringify(newRecords));
  };

  // Sync state and trigger Fleet updates based on rules
  const handleVehicleStatusSync = (vehicleId: string, status: MaintenanceRecord['status']) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    if (status === 'Active') {
      updateVehicle(vehicleId, { ...vehicle, status: 'In Shop' });
    } else if (status === 'Completed') {
      if (vehicle.status === 'In Shop') {
        updateVehicle(vehicleId, { ...vehicle, status: 'Available' });
      }
    } else if (status === 'Cancelled') {
      if (vehicle.status === 'In Shop') {
        updateVehicle(vehicleId, { ...vehicle, status: 'Available' });
      }
    }
  };

  const addRecord = (recordData: Omit<MaintenanceRecord, 'id'>) => {
    const latestNum = records
      .map((r) => parseInt(r.id.replace('MNT', '')))
      .reduce((max, num) => (num > max ? num : max), 15);

    const newId = `MNT${String(latestNum + 1).padStart(3, '0')}`;
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: newId,
    };

    const newRecords = [...records, newRecord];
    saveRecords(newRecords);

    // Sync vehicle status
    handleVehicleStatusSync(recordData.vehicleId, recordData.status);

    return { success: true, recordId: newId };
  };

  const updateRecord = (id: string, updatedData: Omit<MaintenanceRecord, 'id'>) => {
    const existing = records.find((r) => r.id === id);
    if (!existing) return { success: false, error: 'Record not found.' };

    const updatedRecords = records.map((r) => (r.id === id ? { ...updatedData, id } : r));
    saveRecords(updatedRecords);

    // Adjust old vehicle if vehicle changed
    if (existing.vehicleId !== updatedData.vehicleId) {
      const oldVehicle = vehicles.find((v) => v.id === existing.vehicleId);
      if (oldVehicle && oldVehicle.status === 'In Shop') {
        updateVehicle(existing.vehicleId, { ...oldVehicle, status: 'Available' });
      }
    }

    // Sync new vehicle status
    handleVehicleStatusSync(updatedData.vehicleId, updatedData.status);

    return { success: true };
  };

  const deleteRecord = (id: string) => {
    const existing = records.find((r) => r.id === id);
    if (!existing) return { success: false, error: 'Record not found.' };

    const updatedRecords = records.filter((r) => r.id !== id);
    saveRecords(updatedRecords);

    // If it was in shop, release it
    if (existing.status === 'Active') {
      const vehicle = vehicles.find((v) => v.id === existing.vehicleId);
      if (vehicle && vehicle.status === 'In Shop') {
        updateVehicle(existing.vehicleId, { ...vehicle, status: 'Available' });
      }
    }

    return { success: true };
  };

  const markActive = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return { success: false, error: 'Record not found.' };

    const vehicle = vehicles.find((v) => v.id === record.vehicleId);
    if (vehicle && vehicle.status === 'On Trip') {
      return { success: false, error: 'Vehicle currently on active trip. Maintenance cannot begin.' };
    }

    const updatedData: MaintenanceRecord = {
      ...record,
      status: 'Active',
      estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Est: 2 days from now
    };

    const res = updateRecord(id, updatedData);
    return res;
  };

  const markCompleted = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return { success: false, error: 'Record not found.' };

    const updatedData: MaintenanceRecord = {
      ...record,
      status: 'Completed',
      completionDate: new Date().toISOString().split('T')[0],
    };

    const res = updateRecord(id, updatedData);
    return res;
  };

  return (
    <MaintenanceContext.Provider value={{ records, addRecord, updateRecord, deleteRecord, markActive, markCompleted }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
