import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFleet } from './FleetContext';
import { useDrivers } from './DriverContext';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // in kg
  plannedDistance: number; // in km
  expectedRevenue: number;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  notes?: string;
  eta?: string; // Estimated time of arrival
  createdDate: string; // ISO Date YYYY-MM-DD
  dispatchedDate?: string;
  completedDate?: string;
  cancelledDate?: string;

  // Captured on completion
  finalOdometer?: number;
  fuelConsumed?: number;
  additionalExpense?: number;
  completionNotes?: string;
}

interface TripContextType {
  trips: Trip[];
  createTrip: (trip: Omit<Trip, 'id' | 'status' | 'createdDate'>) => { success: boolean; tripId?: string; error?: string };
  dispatchTrip: (id: string) => { success: boolean; error?: string };
  completeTrip: (id: string, completionData: { finalOdometer: number; fuelConsumed: number; additionalExpense: number; completionNotes?: string }) => { success: boolean; error?: string };
  cancelTrip: (id: string) => { success: boolean; error?: string };
}

const TripContext = createContext<TripContextType | undefined>(undefined);

// 16 Relational trips
const SEED_TRIPS: Trip[] = [
  { id: 'TR001', source: 'Ahmedabad', destination: 'Mumbai', vehicleId: '1', driverId: 'd1', cargoWeight: 450, plannedDistance: 530, expectedRevenue: 15000, status: 'Completed', createdDate: '2026-07-01', dispatchedDate: '2026-07-01', completedDate: '2026-07-03', finalOdometer: 74530, fuelConsumed: 80, additionalExpense: 1200, completionNotes: 'Smooth journey, cargo delivered on time.' },
  { id: 'TR002', source: 'Delhi', destination: 'Jaipur', vehicleId: '2', driverId: 'd3', cargoWeight: 5000, plannedDistance: 270, expectedRevenue: 32000, status: 'Dispatched', createdDate: '2026-07-10', dispatchedDate: '2026-07-11', eta: '3h 30m' },
  { id: 'TR003', source: 'Pune', destination: 'Surat', vehicleId: '5', driverId: 'd8', cargoWeight: 8000, plannedDistance: 410, expectedRevenue: 45000, status: 'Dispatched', createdDate: '2026-07-11', dispatchedDate: '2026-07-11', eta: '5h 15m' },
  { id: 'TR004', source: 'Lucknow', destination: 'Delhi', vehicleId: '8', driverId: 'd9', cargoWeight: 480, plannedDistance: 550, expectedRevenue: 18000, status: 'Draft', createdDate: '2026-07-12' },
  { id: 'TR005', source: 'Indore', destination: 'Pune', vehicleId: '6', driverId: 'd5', cargoWeight: 200, plannedDistance: 590, expectedRevenue: 16500, status: 'Completed', createdDate: '2026-07-05', dispatchedDate: '2026-07-05', completedDate: '2026-07-06', finalOdometer: 12590, fuelConsumed: 90, additionalExpense: 500, completionNotes: 'No issues encountered.' },
  { id: 'TR006', source: 'Mumbai', destination: 'Ahmedabad', vehicleId: '7', driverId: 'd12', cargoWeight: 15000, plannedDistance: 530, expectedRevenue: 85000, status: 'Dispatched', createdDate: '2026-07-10', dispatchedDate: '2026-07-11', eta: '6h 45m' },
  { id: 'TR007', source: 'Surat', destination: 'Indore', vehicleId: '11', driverId: 'd10', cargoWeight: 300, plannedDistance: 450, expectedRevenue: 11000, status: 'Cancelled', createdDate: '2026-07-08', cancelledDate: '2026-07-09', completionNotes: 'Client cancelled delivery order.' },
  { id: 'TR008', source: 'Delhi', destination: 'Lucknow', vehicleId: '2', driverId: 'd3', cargoWeight: 4500, plannedDistance: 550, expectedRevenue: 52000, status: 'Completed', createdDate: '2026-07-04', dispatchedDate: '2026-07-04', completedDate: '2026-07-05', finalOdometer: 120550, fuelConsumed: 85, additionalExpense: 1500, completionNotes: 'Delivery completed safely.' },
  { id: 'TR009', source: 'Ahmedabad', destination: 'Delhi', vehicleId: '5', driverId: 'd4', cargoWeight: 7000, plannedDistance: 950, expectedRevenue: 90000, status: 'Draft', createdDate: '2026-07-12' },
  { id: 'TR010', source: 'Mumbai', destination: 'Pune', vehicleId: '1', driverId: 'd1', cargoWeight: 380, plannedDistance: 150, expectedRevenue: 7500, status: 'Completed', createdDate: '2026-07-08', dispatchedDate: '2026-07-08', completedDate: '2026-07-08', finalOdometer: 74150, fuelConsumed: 22, additionalExpense: 200, completionNotes: 'Short run, on schedule.' },
  { id: 'TR011', source: 'Delhi', destination: 'Jaipur', vehicleId: '8', driverId: 'd7', cargoWeight: 450, plannedDistance: 270, expectedRevenue: 9500, status: 'Draft', createdDate: '2026-07-12' },
  { id: 'TR012', source: 'Pune', destination: 'Mumbai', vehicleId: '6', driverId: 'd11', cargoWeight: 180, plannedDistance: 150, expectedRevenue: 6800, status: 'Completed', createdDate: '2026-07-07', dispatchedDate: '2026-07-07', completedDate: '2026-07-07', finalOdometer: 12150, fuelConsumed: 25, additionalExpense: 100 },
  { id: 'TR013', source: 'Lucknow', destination: 'Surat', vehicleId: '7', driverId: 'd12', cargoWeight: 14000, plannedDistance: 1180, expectedRevenue: 95000, status: 'Completed', createdDate: '2026-07-05', dispatchedDate: '2026-07-05', completedDate: '2026-07-07', finalOdometer: 63180, fuelConsumed: 180, additionalExpense: 3500 },
  { id: 'TR014', source: 'Indore', destination: 'Jaipur', vehicleId: '2', driverId: 'd8', cargoWeight: 4000, plannedDistance: 600, expectedRevenue: 55000, status: 'Completed', createdDate: '2026-07-06', dispatchedDate: '2026-07-06', completedDate: '2026-07-08', finalOdometer: 121150, fuelConsumed: 95, additionalExpense: 1100 },
  { id: 'TR015', source: 'Delhi', destination: 'Ahmedabad', vehicleId: '11', driverId: 'd10', cargoWeight: 300, plannedDistance: 950, expectedRevenue: 22000, status: 'Completed', createdDate: '2026-07-02', dispatchedDate: '2026-07-02', completedDate: '2026-07-04', finalOdometer: 32300, fuelConsumed: 145, additionalExpense: 2100 },
  { id: 'TR016', source: 'Surat', destination: 'Mumbai', vehicleId: '8', driverId: 'd9', cargoWeight: 400, plannedDistance: 280, expectedRevenue: 12000, status: 'Draft', createdDate: '2026-07-12' },
];

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vehicles, updateVehicle } = useFleet();
  const { drivers, updateDriver } = useDrivers();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('transitops_trips');
    if (stored) {
      try {
        setTrips(JSON.parse(stored));
      } catch (e) {
        setTrips(SEED_TRIPS);
      }
    } else {
      setTrips(SEED_TRIPS);
      localStorage.setItem('transitops_trips', JSON.stringify(SEED_TRIPS));
    }
  }, []);

  const saveTrips = (newTrips: Trip[]) => {
    setTrips(newTrips);
    localStorage.setItem('transitops_trips', JSON.stringify(newTrips));
  };

  const createTrip = (tripData: Omit<Trip, 'id' | 'status' | 'createdDate'>) => {
    // Generate incremental ID
    const latestNum = trips
      .map((t) => parseInt(t.id.replace('TR', '')))
      .reduce((max, num) => (num > max ? num : max), 16);
    
    const newId = `TR${String(latestNum + 1).padStart(3, '0')}`;

    const newTrip: Trip = {
      ...tripData,
      id: newId,
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
    };

    saveTrips([...trips, newTrip]);
    return { success: true, tripId: newId };
  };

  const dispatchTrip = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return { success: false, error: 'Trip not found.' };

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    if (!vehicle) return { success: false, error: 'Assigned vehicle not found.' };
    if (!driver) return { success: false, error: 'Assigned driver not found.' };

    // Validation checks for dispatching
    if (vehicle.status !== 'Available') {
      return { success: false, error: `Vehicle is currently ${vehicle.status} and cannot be dispatched.` };
    }
    if (driver.status !== 'Available') {
      return { success: false, error: `Driver is currently ${driver.status} and cannot be dispatched.` };
    }

    // Set statuses to On Trip
    const fleetResult = updateVehicle(vehicle.id, { ...vehicle, status: 'On Trip' });
    if (!fleetResult.success) return { success: false, error: fleetResult.error };

    const driverResult = updateDriver(driver.id, { ...driver, status: 'On Trip' });
    if (!driverResult.success) {
      // rollback vehicle status
      updateVehicle(vehicle.id, { ...vehicle, status: 'Available' });
      return { success: false, error: driverResult.error };
    }

    // Update trip status
    const updated = trips.map((t) =>
      t.id === id
        ? {
            ...t,
            status: 'Dispatched' as const,
            dispatchedDate: new Date().toISOString().split('T')[0],
            eta: `${Math.ceil(t.plannedDistance / 60)}h ${Math.ceil(t.plannedDistance % 60)}m`,
          }
        : t
    );

    saveTrips(updated);
    return { success: true };
  };

  const completeTrip = (
    id: string,
    completionData: { finalOdometer: number; fuelConsumed: number; additionalExpense: number; completionNotes?: string }
  ) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return { success: false, error: 'Trip not found.' };

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    if (!vehicle) return { success: false, error: 'Assigned vehicle not found.' };
    if (!driver) return { success: false, error: 'Assigned driver not found.' };

    if (completionData.finalOdometer < vehicle.odometer) {
      return {
        success: false,
        error: `Final odometer (${completionData.finalOdometer} km) cannot be less than vehicle's current odometer (${vehicle.odometer} km).`,
      };
    }

    // Restore vehicle status and update odometer
    const fleetResult = updateVehicle(vehicle.id, {
      ...vehicle,
      status: 'Available',
      odometer: completionData.finalOdometer,
    });
    if (!fleetResult.success) return { success: false, error: fleetResult.error };

    // Restore driver status
    const driverResult = updateDriver(driver.id, { ...driver, status: 'Available' });
    if (!driverResult.success) return { success: false, error: driverResult.error };

    const updated = trips.map((t) =>
      t.id === id
        ? {
            ...t,
            status: 'Completed' as const,
            completedDate: new Date().toISOString().split('T')[0],
            ...completionData,
          }
        : t
    );

    saveTrips(updated);
    return { success: true };
  };

  const cancelTrip = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return { success: false, error: 'Trip not found.' };

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    // If it was already dispatched, restore vehicle and driver to available
    if (trip.status === 'Dispatched') {
      if (vehicle && vehicle.status === 'On Trip') {
        updateVehicle(vehicle.id, { ...vehicle, status: 'Available' });
      }
      if (driver && driver.status === 'On Trip') {
        updateDriver(driver.id, { ...driver, status: 'Available' });
      }
    }

    const updated = trips.map((t) =>
      t.id === id
        ? {
            ...t,
            status: 'Cancelled' as const,
            cancelledDate: new Date().toISOString().split('T')[0],
          }
        : t
    );

    saveTrips(updated);
    return { success: true };
  };

  return (
    <TripContext.Provider value={{ trips, createTrip, dispatchTrip, completeTrip, cancelTrip }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};
