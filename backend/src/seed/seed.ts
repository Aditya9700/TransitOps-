import mongoose from 'mongoose';
import connectDB from '../config/db';
import { Driver } from '../models/Driver';
import { Expense } from '../models/Expense';
import { FuelLog } from '../models/FuelLog';
import { Maintenance } from '../models/Maintenance';
import { Trip } from '../models/Trip';
import User from '../models/User';
import { Vehicle } from '../models/Vehicle';
import {
  DRIVER_CATEGORIES,
  DRIVER_STATUSES,
  EXPENSE_CATEGORIES,
  EXPENSE_STATUSES,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  ROLES,
  TRIP_STATUSES,
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
} from '../utils/constants';

const users = [
  { name: 'Aditi Shah', email: 'fleet.manager@transitops.dev', password: 'Password@123', role: ROLES[0] },
  { name: 'Rohit Mehta', email: 'dispatcher@transitops.dev', password: 'Password@123', role: ROLES[1] },
  { name: 'Nina Rao', email: 'safety@transitops.dev', password: 'Password@123', role: ROLES[2] },
  { name: 'Karan Patel', email: 'finance@transitops.dev', password: 'Password@123', role: ROLES[3] },
];

const vehicleTemplates = Array.from({ length: 10 }, (_, index) => ({
  registrationNumber: `TS-${2026 + index}-${String(index + 1).padStart(3, '0')}`,
  name: `Transit Vehicle ${index + 1}`,
  type: VEHICLE_TYPES[index % VEHICLE_TYPES.length],
  capacity: 1000 + index * 250,
  capacityUnit: index % 2 === 0 ? 'kg' : 'Ton',
  odometer: 15000 + index * 1125,
  acquisitionCost: 1500000 + index * 50000,
  status: VEHICLE_STATUSES[index % VEHICLE_STATUSES.length],
}));

const driverTemplates = Array.from({ length: 12 }, (_, index) => ({
  name: `Driver ${index + 1}`,
  licenseNumber: `LIC-${202600 + index}`,
  category: DRIVER_CATEGORIES[index % DRIVER_CATEGORIES.length],
  licenseExpiry: new Date(Date.now() + (index + 1) * 86400000 * 120),
  contactNumber: `98765${String(10000 + index).slice(-5)}`,
  email: `driver${index + 1}@transitops.dev`,
  tripCompletionRate: 82 + (index % 18),
  safetyScore: 70 + (index % 25),
  status: DRIVER_STATUSES[index % DRIVER_STATUSES.length],
}));

const seed = async (): Promise<void> => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Trip.deleteMany({}),
    Maintenance.deleteMany({}),
    FuelLog.deleteMany({}),
    Expense.deleteMany({}),
  ]);

  const createdUsers = await User.create(users);
  const createdVehicles = await Vehicle.insertMany(vehicleTemplates);

  const driverDocs = driverTemplates.map((driver, index) => ({
    ...driver,
    assignedVehicle: createdVehicles[index % createdVehicles.length]._id,
  }));
  const createdDrivers = await Driver.insertMany(driverDocs);

  const trips = Array.from({ length: 20 }, (_, index) => {
    const vehicle = createdVehicles[index % createdVehicles.length];
    const driver = createdDrivers[index % createdDrivers.length];
    return {
      tripCode: `TRP-${202600 + index}`,
      vehicle: vehicle._id,
      driver: driver._id,
      source: `City ${index + 1}`,
      destination: `Hub ${index + 2}`,
      cargoWeight: 300 + index * 250,
      plannedDistance: 50 + index * 13,
      expectedRevenue: 5000 + index * 750,
      status: TRIP_STATUSES[index % TRIP_STATUSES.length],
      createdDate: new Date(Date.now() - index * 86400000 * 2),
      dispatchedDate: index % 4 !== 0 ? new Date(Date.now() - index * 86400000 * 2) : null,
      completedDate: index % 4 === 2 ? new Date(Date.now() - index * 86400000) : null,
      cancelledDate: index % 4 === 3 ? new Date(Date.now() - index * 86400000) : null,
      eta: `${Math.ceil((50 + index * 13) / 60)}h ${(50 + index * 13) % 60}m`,
      finalOdometer: index % 4 === 2 ? vehicle.odometer + 50 + index * 13 : undefined,
      fuelConsumed: index % 4 === 2 ? 20 + index : undefined,
      additionalExpense: index % 4 === 2 ? 300 + index * 25 : undefined,
      notes: `Seed trip ${index + 1}`,
      completionNotes: index % 4 === 2 ? `Seed completion ${index + 1}` : undefined,
    };
  });
  const createdTrips = await Trip.insertMany(trips);

  const maintenances = Array.from({ length: 15 }, (_, index) => {
    const vehicle = createdVehicles[index % createdVehicles.length];
    return {
      maintenanceCode: `MTN-${202600 + index}`,
      vehicle: vehicle._id,
      serviceType: `Maintenance ${index + 1}`,
      description: `Seed maintenance work order ${index + 1}`,
      category: MAINTENANCE_CATEGORIES[index % MAINTENANCE_CATEGORIES.length],
      status: MAINTENANCE_STATUSES[index % MAINTENANCE_STATUSES.length],
      scheduledDate: new Date(Date.now() - index * 86400000 * 3),
      estimatedCompletion: index % 3 !== 0 ? new Date(Date.now() + (index + 1) * 86400000) : null,
      completionDate: index % 3 === 0 ? new Date(Date.now() - index * 86400000 * 2) : null,
      estimatedCost: 12000 + index * 1800,
      mechanicName: `Mechanic ${index % 5 + 1}`,
      priority: MAINTENANCE_PRIORITIES[index % MAINTENANCE_PRIORITIES.length],
      notes: `Seed maintenance ${index + 1}`,
    };
  });
  const createdMaintenance = await Maintenance.insertMany(maintenances);

  const fuelLogs = Array.from({ length: 20 }, (_, index) => {
    const vehicle = createdVehicles[index % createdVehicles.length];
    const driver = createdDrivers[index % createdDrivers.length];
    const trip = createdTrips[index % createdTrips.length];
    return {
      fuelCode: `FUEL-${202600 + index}`,
      vehicle: vehicle._id,
      trip: trip._id,
      driver: driver._id,
      date: new Date(Date.now() - index * 86400000),
      fuelQuantity: 45 + index * 2,
      fuelCost: (45 + index * 2) * (96 + index),
      odometer: vehicle.odometer + index * 120,
      fuelStation: `Station ${index % 6 + 1}`,
      notes: `Seed fuel log ${index + 1}`,
    };
  });
  await FuelLog.insertMany(fuelLogs);

  const expenses = Array.from({ length: 20 }, (_, index) => {
    const vehicle = createdVehicles[index % createdVehicles.length];
    const trip = createdTrips[index % createdTrips.length];
    return {
      expenseCode: `EXP-${202600 + index}`,
      expenseCategory: EXPENSE_CATEGORIES[index % EXPENSE_CATEGORIES.length],
      status: EXPENSE_STATUSES[index % EXPENSE_STATUSES.length],
      amount: 2500 + index * 300,
      expenseDate: new Date(Date.now() - index * 86400000 * 1.5),
      description: `Expense ${index + 1}`,
      vehicle: vehicle._id,
      trip: trip._id,
    };
  });
  await Expense.insertMany(expenses);

  const sampleUser = await User.findById(createdUsers[0]._id).select('+password');
  const passwordCheck = sampleUser ? await sampleUser.comparePassword('Password@123') : false;

  console.log(
    JSON.stringify(
      {
        users: createdUsers.length,
        vehicles: createdVehicles.length,
        drivers: createdDrivers.length,
        trips: createdTrips.length,
        maintenance: createdMaintenance.length,
        fuelLogs: fuelLogs.length,
        expenses: expenses.length,
        passwordHashVerified: passwordCheck,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

void seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
