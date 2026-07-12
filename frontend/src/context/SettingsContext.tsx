import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export type AppModule =
  | 'Dashboard'
  | 'Fleet'
  | 'Drivers'
  | 'Trips'
  | 'Maintenance'
  | 'Fuel & Expenses'
  | 'Analytics'
  | 'Settings';

export type PermissionLevel = 'No Access' | 'View' | 'Create' | 'Edit' | 'Delete' | 'Manage';

export interface GeneralSettings {
  depotName: string;
  companyName: string;
  currency: string;
  distanceUnit: 'km' | 'miles';
  fuelUnit: 'Liters' | 'Gallons';
  timezone: string;
  dateFormat: string;
  language: string;
  theme: 'Light' | 'Dark' | 'System';
  landingPage: 'Dashboard' | 'Fleet' | 'Trips';
  autoSaveInterval: number;
  notificationPreference: 'Email' | 'Browser' | 'Both';
}

export interface Preferences {
  emailAlerts: boolean;
  browserAlerts: boolean;
  maintenanceAlerts: boolean;
  licenseAlerts: boolean;
  fuelAlerts: boolean;
  animations: boolean;
  autoRefresh: boolean;
  darkMode: boolean;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export type PermissionMatrix = Record<Role, Record<AppModule, PermissionLevel>>;

interface SettingsContextType {
  settings: GeneralSettings;
  preferences: Preferences;
  users: DemoUser[];
  permissionMatrix: PermissionMatrix;
  saveSettings: (updated: GeneralSettings) => void;
  savePreferences: (updated: Preferences) => void;
  updatePermission: (role: Role, module: AppModule, level: PermissionLevel) => void;
  addUser: (user: Omit<DemoUser, 'id'>) => { success: boolean; userId?: string };
  updateUser: (id: string, updated: Omit<DemoUser, 'id'>) => { success: boolean };
  deleteUser: (id: string) => { success: boolean };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: GeneralSettings = {
  depotName: 'Ahmedabad Main Depot',
  companyName: 'TransitOps Logistics India',
  currency: 'INR',
  distanceUnit: 'km',
  fuelUnit: 'Liters',
  timezone: 'Asia/Kolkata (GMT+05:30)',
  dateFormat: 'YYYY-MM-DD',
  language: 'English',
  theme: 'System',
  landingPage: 'Dashboard',
  autoSaveInterval: 5,
  notificationPreference: 'Both',
};

const DEFAULT_PREFERENCES: Preferences = {
  emailAlerts: true,
  browserAlerts: true,
  maintenanceAlerts: true,
  licenseAlerts: true,
  fuelAlerts: false,
  animations: true,
  autoRefresh: true,
  darkMode: false,
};

const SEED_USERS: DemoUser[] = [
  { id: 'USR001', name: 'Amit Sharma', email: 'amit.sharma@transitops.in', role: 'Fleet Manager', status: 'Active', lastLogin: '2026-07-12 14:32' },
  { id: 'USR002', name: 'Rohan Verma', email: 'rohan.verma@transitops.in', role: 'Dispatcher', status: 'Active', lastLogin: '2026-07-12 15:10' },
  { id: 'USR003', name: 'Priya Patel', email: 'priya.patel@transitops.in', role: 'Safety Officer', status: 'Active', lastLogin: '2026-07-12 11:45' },
  { id: 'USR004', name: 'Vikram Singh', email: 'vikram.singh@transitops.in', role: 'Financial Analyst', status: 'Active', lastLogin: '2026-07-11 17:20' },
  { id: 'USR005', name: 'Siddharth Rao', email: 'sid.rao@transitops.in', role: 'Dispatcher', status: 'Inactive', lastLogin: '2026-06-30 09:15' },
  { id: 'USR006', name: 'Neha Gupta', email: 'neha.gupta@transitops.in', role: 'Safety Officer', status: 'Inactive', lastLogin: '2026-07-02 10:00' },
];

const DEFAULT_MATRIX: PermissionMatrix = {
  'Fleet Manager': {
    Dashboard: 'Manage',
    Fleet: 'Manage',
    Drivers: 'Manage',
    Trips: 'Manage',
    Maintenance: 'Manage',
    'Fuel & Expenses': 'Manage',
    Analytics: 'Manage',
    Settings: 'Manage',
  },
  Dispatcher: {
    Dashboard: 'View',
    Fleet: 'View',
    Drivers: 'No Access',
    Trips: 'Manage',
    Maintenance: 'No Access',
    'Fuel & Expenses': 'No Access',
    Analytics: 'No Access',
    Settings: 'No Access',
  },
  'Safety Officer': {
    Dashboard: 'View',
    Fleet: 'No Access',
    Drivers: 'Manage',
    Trips: 'No Access',
    Maintenance: 'Manage',
    'Fuel & Expenses': 'No Access',
    Analytics: 'No Access',
    Settings: 'No Access',
  },
  'Financial Analyst': {
    Dashboard: 'View',
    Fleet: 'No Access',
    Drivers: 'No Access',
    Trips: 'No Access',
    Maintenance: 'No Access',
    'Fuel & Expenses': 'Manage',
    Analytics: 'Manage',
    Settings: 'No Access',
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [preferences, setPreferencesState] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(DEFAULT_MATRIX);

  useEffect(() => {
    const storedSettings = localStorage.getItem('transitops_settings');
    const storedPrefs = localStorage.getItem('transitops_preferences');
    const storedUsers = localStorage.getItem('transitops_demo_users');
    const storedMatrix = localStorage.getItem('transitops_rbac_matrix');

    if (storedSettings) setSettingsState(JSON.parse(storedSettings));
    if (storedPrefs) setPreferencesState(JSON.parse(storedPrefs));
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(SEED_USERS);
      localStorage.setItem('transitops_demo_users', JSON.stringify(SEED_USERS));
    }

    if (storedMatrix) {
      setPermissionMatrix(JSON.parse(storedMatrix));
    } else {
      setPermissionMatrix(DEFAULT_MATRIX);
      localStorage.setItem('transitops_rbac_matrix', JSON.stringify(DEFAULT_MATRIX));
    }
  }, []);

  const saveSettings = (updated: GeneralSettings) => {
    setSettingsState(updated);
    localStorage.setItem('transitops_settings', JSON.stringify(updated));
  };

  const savePreferences = (updated: Preferences) => {
    setPreferencesState(updated);
    localStorage.setItem('transitops_preferences', JSON.stringify(updated));
  };

  const updatePermission = (role: Role, module: AppModule, level: PermissionLevel) => {
    const updated = {
      ...permissionMatrix,
      [role]: {
        ...permissionMatrix[role],
        [module]: level,
      },
    };
    setPermissionMatrix(updated);
    localStorage.setItem('transitops_rbac_matrix', JSON.stringify(updated));
  };

  const addUser = (userData: Omit<DemoUser, 'id'>) => {
    const latestNum = users
      .map((u) => parseInt(u.id.replace('USR', '')))
      .reduce((max, num) => (num > max ? num : max), 6);

    const newId = `USR${String(latestNum + 1).padStart(3, '0')}`;
    const newUser: DemoUser = { ...userData, id: newId };
    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('transitops_demo_users', JSON.stringify(updated));
    return { success: true, userId: newId };
  };

  const updateUser = (id: string, updatedData: Omit<DemoUser, 'id'>) => {
    const updated = users.map((u) => (u.id === id ? { ...updatedData, id } : u));
    setUsers(updated);
    localStorage.setItem('transitops_demo_users', JSON.stringify(updated));
    return { success: true };
  };

  const deleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    localStorage.setItem('transitops_demo_users', JSON.stringify(updated));
    return { success: true };
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        preferences,
        users,
        permissionMatrix,
        saveSettings,
        savePreferences,
        updatePermission,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
