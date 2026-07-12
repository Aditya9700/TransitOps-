import React, { createContext, useContext, useState, useEffect } from 'react';

export type VehicleType = 'Van' | 'Truck' | 'Mini' | 'Trailer';
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: VehicleType;
  capacity: number;
  capacityUnit: 'kg' | 'Ton';
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
}

interface FleetContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => { success: boolean; error?: string };
  updateVehicle: (id: string, vehicle: Omit<Vehicle, 'id'>) => { success: boolean; error?: string };
  deleteVehicle: (id: string) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

// 11 Seed vehicle records
const SEED_VEHICLES: Vehicle[] = [
  { id: '1', registrationNumber: 'GJ01AB4523', name: 'VAN-05', type: 'Van', capacity: 500, capacityUnit: 'kg', odometer: 74000, acquisitionCost: 620000, status: 'Available' },
  { id: '2', registrationNumber: 'MH02CD8844', name: 'TRUCK-11', type: 'Truck', capacity: 5, capacityUnit: 'Ton', odometer: 120000, acquisitionCost: 2400000, status: 'On Trip' },
  { id: '3', registrationNumber: 'DL03EF1234', name: 'MINI-03', type: 'Mini', capacity: 300, capacityUnit: 'kg', odometer: 45000, acquisitionCost: 410000, status: 'In Shop' },
  { id: '4', registrationNumber: 'KA04GH5678', name: 'VAN-09', type: 'Van', capacity: 600, capacityUnit: 'kg', odometer: 210000, acquisitionCost: 650000, status: 'Retired' },
  { id: '5', registrationNumber: 'GJ02XY1122', name: 'TRUCK-08', type: 'Truck', capacity: 8, capacityUnit: 'Ton', odometer: 89000, acquisitionCost: 3100000, status: 'Available' },
  { id: '6', registrationNumber: 'MH12PQ9988', name: 'MINI-01', type: 'Mini', capacity: 250, capacityUnit: 'kg', odometer: 12000, acquisitionCost: 380000, status: 'Available' },
  { id: '7', registrationNumber: 'HR55AB5555', name: 'TRAILER-02', type: 'Trailer', capacity: 15, capacityUnit: 'Ton', odometer: 62000, acquisitionCost: 4500000, status: 'On Trip' },
  { id: '8', registrationNumber: 'DL01JK3344', name: 'VAN-12', type: 'Van', capacity: 500, capacityUnit: 'kg', odometer: 98000, acquisitionCost: 630000, status: 'Available' },
  { id: '9', registrationNumber: 'KA03MN4455', name: 'TRUCK-14', type: 'Truck', capacity: 10, capacityUnit: 'Ton', odometer: 150000, acquisitionCost: 3500000, status: 'In Shop' },
  { id: '10', registrationNumber: 'GJ01ZZ7788', name: 'TRAILER-05', type: 'Trailer', capacity: 20, capacityUnit: 'Ton', odometer: 180000, acquisitionCost: 5200000, status: 'Retired' },
  { id: '11', registrationNumber: 'MH09EF4433', name: 'MINI-04', type: 'Mini', capacity: 350, capacityUnit: 'kg', odometer: 32000, acquisitionCost: 420000, status: 'Available' },
];

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('transitops_vehicles');
    if (stored) {
      try {
        setVehicles(JSON.parse(stored));
      } catch (e) {
        setVehicles(SEED_VEHICLES);
      }
    } else {
      setVehicles(SEED_VEHICLES);
      localStorage.setItem('transitops_vehicles', JSON.stringify(SEED_VEHICLES));
    }
  }, []);

  const saveVehicles = (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
    localStorage.setItem('transitops_vehicles', JSON.stringify(newVehicles));
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const exists = vehicles.some(
      (v) => v.registrationNumber.toLowerCase() === vehicle.registrationNumber.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'Registration number must be unique.' };
    }

    const newVehicle: Vehicle = {
      ...vehicle,
      id: Math.random().toString(36).substring(2, 9),
    };
    saveVehicles([...vehicles, newVehicle]);
    return { success: true };
  };

  const updateVehicle = (id: string, vehicle: Omit<Vehicle, 'id'>) => {
    const exists = vehicles.some(
      (v) =>
        v.id !== id &&
        v.registrationNumber.toLowerCase() === vehicle.registrationNumber.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'Registration number must be unique.' };
    }

    const updated = vehicles.map((v) => (v.id === id ? { ...vehicle, id } : v));
    saveVehicles(updated);
    return { success: true };
  };

  const deleteVehicle = (id: string) => {
    const filtered = vehicles.filter((v) => v.id !== id);
    saveVehicles(filtered);
  };

  return (
    <FleetContext.Provider value={{ vehicles, addVehicle, updateVehicle, deleteVehicle }}>
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
