export const ROLES = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] as const;
export const VEHICLE_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'] as const;
export const VEHICLE_TYPES = ['Van', 'Truck', 'Mini', 'Trailer'] as const;
export const DRIVER_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'] as const;
export const DRIVER_CATEGORIES = ['LMV', 'HMV'] as const;
export const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'] as const;
export const MAINTENANCE_STATUSES = ['Scheduled', 'Active', 'Completed', 'Cancelled'] as const;
export const MAINTENANCE_CATEGORIES = [
  'Oil Change',
  'Engine Repair',
  'Tyre Replacement',
  'Brake Service',
  'Battery',
  'General Inspection',
] as const;
export const MAINTENANCE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const EXPENSE_CATEGORIES = [
  'Toll',
  'Maintenance',
  'Parking',
  'Repair',
  'Cleaning',
  'Insurance',
  'Miscellaneous',
] as const;
export const EXPENSE_STATUSES = ['Paid', 'Pending', 'Rejected'] as const;
