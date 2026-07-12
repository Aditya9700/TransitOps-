import React, { createContext, useContext, useState, useEffect } from 'react';

export type LicenseCategory = 'LMV' | 'HMV';
export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  category: LicenseCategory;
  licenseExpiry: string; // ISO format (YYYY-MM-DD)
  contactNumber: string;
  email: string;
  tripCompletionRate: number; // e.g., 96 for 96%
  safetyScore: number; // 0 - 100
  status: DriverStatus;
}

interface DriverContextType {
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id'>) => { success: boolean; error?: string };
  updateDriver: (id: string, driver: Omit<Driver, 'id'>) => { success: boolean; error?: string };
  deleteDriver: (id: string) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

// Today's Date in Hackathon Context: 2026-07-12
export const CURRENT_DATE_STRING = '2026-07-12';

// 12 Initial Seed Drivers
const SEED_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Rajesh Kumar', licenseNumber: 'DL-858213', category: 'LMV', licenseExpiry: '2028-12-15', contactNumber: '9876543210', email: 'rajesh.kumar@transitops.com', tripCompletionRate: 96, safetyScore: 95, status: 'Available' },
  { id: 'd2', name: 'Amit Sharma', licenseNumber: 'DL-44120', category: 'HMV', licenseExpiry: '2025-03-10', contactNumber: '9123456789', email: 'amit.sharma@transitops.com', tripCompletionRate: 91, safetyScore: 72, status: 'Suspended' },
  { id: 'd3', name: 'Priya Sharma', licenseNumber: 'DL-77031', category: 'LMV', licenseExpiry: '2027-08-20', contactNumber: '9876599887', email: 'priya.sharma@transitops.com', tripCompletionRate: 99, safetyScore: 98, status: 'On Trip' },
  { id: 'd4', name: 'Vikram Singh', licenseNumber: 'HR-12345', category: 'HMV', licenseExpiry: '2026-07-28', contactNumber: '9712345678', email: 'vikram.singh@transitops.com', tripCompletionRate: 88, safetyScore: 84, status: 'Available' },
  { id: 'd5', name: 'Sanjay Gupta', licenseNumber: 'MH-99887', category: 'LMV', licenseExpiry: '2029-01-05', contactNumber: '9567891234', email: 'sanjay.gupta@transitops.com', tripCompletionRate: 95, safetyScore: 91, status: 'Off Duty' },
  { id: 'd6', name: 'Anil Mehta', licenseNumber: 'GJ-44552', category: 'HMV', licenseExpiry: '2026-06-15', contactNumber: '9898989898', email: 'anil.mehta@transitops.com', tripCompletionRate: 78, safetyScore: 55, status: 'Suspended' },
  { id: 'd7', name: 'Neha Reddy', licenseNumber: 'KA-77889', category: 'LMV', licenseExpiry: '2026-08-05', contactNumber: '9663322110', email: 'neha.reddy@transitops.com', tripCompletionRate: 98, safetyScore: 96, status: 'Available' },
  { id: 'd8', name: 'Manoj Yadav', licenseNumber: 'UP-33221', category: 'HMV', licenseExpiry: '2028-09-30', contactNumber: '9412345678', email: 'manoj.yadav@transitops.com', tripCompletionRate: 93, safetyScore: 89, status: 'On Trip' },
  { id: 'd9', name: 'Sunita Rao', licenseNumber: 'TN-55667', category: 'LMV', licenseExpiry: '2027-05-18', contactNumber: '9345678912', email: 'sunita.rao@transitops.com', tripCompletionRate: 94, safetyScore: 92, status: 'Available' },
  { id: 'd10', name: 'Deepak Joshi', licenseNumber: 'RJ-11223', category: 'HMV', licenseExpiry: '2028-11-22', contactNumber: '9789012345', email: 'deepak.joshi@transitops.com', tripCompletionRate: 82, safetyScore: 68, status: 'Available' },
  { id: 'd11', name: 'Kiran Deshmukh', licenseNumber: 'MH-55443', category: 'LMV', licenseExpiry: '2026-07-02', contactNumber: '9900112233', email: 'kiran.d@transitops.com', tripCompletionRate: 89, safetyScore: 79, status: 'Off Duty' },
  { id: 'd12', name: 'Arjun Nair', licenseNumber: 'KL-88990', category: 'HMV', licenseExpiry: '2027-10-10', contactNumber: '9087654321', email: 'arjun.nair@transitops.com', tripCompletionRate: 97, safetyScore: 94, status: 'On Trip' },
];

export const getLicenseValidityState = (expiryDateString: string): 'Valid' | 'Expiring Soon' | 'Expired' => {
  const today = new Date(CURRENT_DATE_STRING);
  const expiry = new Date(expiryDateString);
  
  if (expiry < today) {
    return 'Expired';
  }
  
  // Difference in milliseconds
  const diffTime = expiry.getTime() - today.getTime();
  // Difference in days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) {
    return 'Expiring Soon';
  }
  
  return 'Valid';
};

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('transitops_drivers');
    if (stored) {
      try {
        setDrivers(JSON.parse(stored));
      } catch (e) {
        setDrivers(SEED_DRIVERS);
      }
    } else {
      setDrivers(SEED_DRIVERS);
      localStorage.setItem('transitops_drivers', JSON.stringify(SEED_DRIVERS));
    }
  }, []);

  const saveDrivers = (newDrivers: Driver[]) => {
    setDrivers(newDrivers);
    localStorage.setItem('transitops_drivers', JSON.stringify(newDrivers));
  };

  const addDriver = (driver: Omit<Driver, 'id'>) => {
    const exists = drivers.some(
      (d) => d.licenseNumber.toLowerCase() === driver.licenseNumber.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'License number must be unique.' };
    }

    const newDriver: Driver = {
      ...driver,
      id: 'd_' + Math.random().toString(36).substring(2, 9),
    };
    saveDrivers([...drivers, newDriver]);
    return { success: true };
  };

  const updateDriver = (id: string, driver: Omit<Driver, 'id'>) => {
    const exists = drivers.some(
      (d) =>
        d.id !== id &&
        d.licenseNumber.toLowerCase() === driver.licenseNumber.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'License number must be unique.' };
    }

    const updated = drivers.map((d) => (d.id === id ? { ...driver, id } : d));
    saveDrivers(updated);
    return { success: true };
  };

  const deleteDriver = (id: string) => {
    const filtered = drivers.filter((d) => d.id !== id);
    saveDrivers(filtered);
  };

  return (
    <DriverContext.Provider value={{ drivers, addDriver, updateDriver, deleteDriver }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDrivers = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDrivers must be used within a DriverProvider');
  }
  return context;
};
