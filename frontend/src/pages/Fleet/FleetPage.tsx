import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFleet, type Vehicle, type VehicleStatus } from '../../context/FleetContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Info, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import { toast } from 'sonner';

// Zod validation schema for Add/Edit Vehicle form
const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration Number is required').toUpperCase().trim(),
  name: z.string().min(1, 'Vehicle Name is required').trim(),
  type: z.enum(['Van', 'Truck', 'Mini', 'Trailer'] as const),
  capacity: z.preprocess((val) => Number(val), z.number().gt(0, 'Capacity must be greater than 0')),
  capacityUnit: z.enum(['kg', 'Ton'] as const),
  odometer: z.preprocess((val) => Number(val), z.number().min(0, 'Odometer must be greater than or equal to 0')),
  acquisitionCost: z.preprocess((val) => Number(val), z.number().gt(0, 'Acquisition Cost must be greater than 0')),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired'] as const),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

type SortField = 'registrationNumber' | 'capacity' | 'odometer' | 'acquisitionCost';
type SortOrder = 'asc' | 'desc';

export const FleetPage: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFleet();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('registrationNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Dialog State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  // Form setup using React Hook Form and zod validation
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      registrationNumber: '',
      name: '',
      type: 'Van',
      capacity: 0,
      capacityUnit: 'kg',
      odometer: 0,
      acquisitionCost: 0,
      status: 'Available',
    },
  });

  // Watch vehicle type to auto-adjust standard capacity unit
  const watchedType = watch('type');
  React.useEffect(() => {
    if (watchedType === 'Truck' || watchedType === 'Trailer') {
      setValue('capacityUnit', 'Ton');
    } else {
      setValue('capacityUnit', 'kg');
    }
  }, [watchedType, setValue]);

  // Open Dialog for Add
  const handleOpenAdd = () => {
    setEditingVehicle(null);
    reset({
      registrationNumber: '',
      name: '',
      type: 'Van',
      capacity: 0,
      capacityUnit: 'kg',
      odometer: 0,
      acquisitionCost: 0,
      status: 'Available',
    });
    setIsAddEditOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    reset({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      capacity: vehicle.capacity,
      capacityUnit: vehicle.capacityUnit,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
    });
    setIsAddEditOpen(true);
  };

  // Open Dialog for Delete Confirmation
  const handleOpenDelete = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle);
    setIsDeleteOpen(true);
  };

  // Form Submit Handler
  const onSubmit = (data: VehicleFormValues) => {
    if (editingVehicle) {
      // Edit mode
      const result = updateVehicle(editingVehicle.id, data);
      if (result.success) {
        toast.success(`Vehicle ${data.name} updated successfully.`);
        setIsAddEditOpen(false);
      } else {
        toast.error(result.error || 'Failed to update vehicle.');
      }
    } else {
      // Add mode
      const result = addVehicle(data);
      if (result.success) {
        toast.success(`Vehicle ${data.name} registered successfully.`);
        setIsAddEditOpen(false);
      } else {
        toast.error(result.error || 'Failed to register vehicle.');
      }
    }
  };

  // Delete Action handler
  const handleDeleteConfirm = () => {
    if (deletingVehicle) {
      deleteVehicle(deletingVehicle.id);
      toast.success(`Vehicle ${deletingVehicle.name} deleted.`);
      setIsDeleteOpen(false);
      setDeletingVehicle(null);
    }
  };

  // Sort toggle handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted vehicles list computation
  const processedVehicles = useMemo(() => {
    return vehicles
      .filter((vehicle) => {
        // Search text filter
        const matchesSearch =
          vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Dropdown type filter
        const matchesType = typeFilter === 'All' || vehicle.type === typeFilter;

        // Dropdown status filter
        const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        let fieldA = a[sortField];
        let fieldB = b[sortField];

        // Custom comparator for capacity taking units into account (Normalizing tons to kg for comparison)
        if (sortField === 'capacity') {
          const capA = a.capacityUnit === 'Ton' ? a.capacity * 1000 : a.capacity;
          const capB = b.capacityUnit === 'Ton' ? b.capacity * 1000 : b.capacity;
          fieldA = capA;
          fieldB = capB;
        }

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return sortOrder === 'asc'
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
          return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        return 0;
      });
  }, [vehicles, searchQuery, typeFilter, statusFilter, sortField, sortOrder]);

  const getStatusBadgeVariant = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'On Trip':
        return 'primary';
      case 'In Shop':
        return 'warning';
      case 'Retired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Sort indicator helper
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Manage transport assets, load capacities, and odometer readings.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center space-x-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="w-full space-y-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Search
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Registration no. or vehicle name..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-hidden transition-all duration-200"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select
              label="Vehicle Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Van', label: 'Van' },
                { value: 'Truck', label: 'Truck' },
                { value: 'Mini', label: 'Mini' },
                { value: 'Trailer', label: 'Trailer' },
              ]}
            />

            {/* Status Filter */}
            <Select
              label="Vehicle Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Available', label: 'Available' },
                { value: 'On Trip', label: 'On Trip' },
                { value: 'In Shop', label: 'In Shop (Maintenance)' },
                { value: 'Retired', label: 'Retired' },
              ]}
            />
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('All');
              setStatusFilter('All');
            }}
            className="h-10 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 cursor-pointer w-full md:w-auto shrink-0"
          >
            Reset Filters
          </button>
        </CardContent>
      </Card>

      {/* Vehicle List Table */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0 overflow-x-auto">
          {processedVehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 select-none">
                    <button
                      onClick={() => handleSort('registrationNumber')}
                      className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Registration Number {renderSortIcon('registrationNumber')}
                    </button>
                  </TableHead>
                  <TableHead>Vehicle Name / Model</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead className="select-none">
                    <button
                      onClick={() => handleSort('capacity')}
                      className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Max Capacity {renderSortIcon('capacity')}
                    </button>
                  </TableHead>
                  <TableHead className="select-none">
                    <button
                      onClick={() => handleSort('odometer')}
                      className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Odometer {renderSortIcon('odometer')}
                    </button>
                  </TableHead>
                  <TableHead className="select-none">
                    <button
                      onClick={() => handleSort('acquisitionCost')}
                      className="group flex items-center hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Acquisition Cost {renderSortIcon('acquisitionCost')}
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-semibold text-slate-900 pl-6">
                      {vehicle.registrationNumber}
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium">{vehicle.name}</TableCell>
                    <TableCell className="text-slate-500">{vehicle.type}</TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {vehicle.capacity} {vehicle.capacityUnit}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {vehicle.odometer.toLocaleString()} km
                    </TableCell>
                    <TableCell className="text-slate-900 font-medium">
                      ${vehicle.acquisitionCost.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                        {vehicle.status === 'In Shop' ? 'In Shop' : vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end items-center space-x-2.5">
                        <button
                          onClick={() => handleOpenEdit(vehicle)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit vehicle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(vehicle)}
                          className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50/55 rounded-lg transition-colors cursor-pointer"
                          title="Delete vehicle"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-slate-400">
              No vehicles found matching the selected search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Rules Banner */}
      <Card className="bg-slate-50 border border-slate-200">
        <CardContent className="p-5 flex items-start space-x-3.5">
          <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div className="text-left space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900">Mandatory Business Rules Enforced</h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4 font-medium leading-relaxed">
              <li>Registration Number must be globally unique across the fleet registry.</li>
              <li>Retired vehicles are locked and cannot be assigned/dispatched to active shifts.</li>
              <li>Vehicles placed in Shop (Maintenance) automatically set state constraints and hide from dispatcher selection pools.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog Modal */}
      <Dialog isOpen={isAddEditOpen} onClose={() => setIsAddEditOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editingVehicle ? 'Edit Vehicle Info' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {editingVehicle 
              ? 'Update the parameters of this vehicle asset. All fields must follow compliance rules.' 
              : 'Enter parameters to register a new vehicle asset in the TransitOps registry.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              id="registrationNumber"
              placeholder="e.g. GJ01AB4523"
              error={errors.registrationNumber?.message}
              {...register('registrationNumber')}
            />

            <Input
              label="Vehicle Name"
              id="name"
              placeholder="e.g. VAN-05"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Vehicle Type"
              id="type"
              options={[
                { value: 'Van', label: 'Van' },
                { value: 'Truck', label: 'Truck' },
                { value: 'Mini', label: 'Mini' },
                { value: 'Trailer', label: 'Trailer' },
              ]}
              error={errors.type?.message}
              {...register('type')}
            />

            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-2">
                <Input
                  label="Max Capacity"
                  id="capacity"
                  type="number"
                  step="any"
                  placeholder="500"
                  error={errors.capacity?.message}
                  {...register('capacity')}
                />
              </div>
              <div className="col-span-1">
                <Select
                  label="Unit"
                  id="capacityUnit"
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'Ton', label: 'Ton' },
                  ]}
                  error={errors.capacityUnit?.message}
                  {...register('capacityUnit')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Odometer (km)"
              id="odometer"
              type="number"
              placeholder="74000"
              error={errors.odometer?.message}
              {...register('odometer')}
            />

            <Input
              label="Acquisition Cost ($)"
              id="acquisitionCost"
              type="number"
              placeholder="620000"
              error={errors.acquisitionCost?.message}
              {...register('acquisitionCost')}
            />
          </div>

          <Select
            label="Vehicle Status"
            id="status"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'In Shop', label: 'In Shop (Maintenance)' },
              { value: 'Retired', label: 'Retired' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Dialog Confirmation Modal */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-danger flex items-center space-x-2">
            <span>Confirm Deletion</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete vehicle <strong>{deletingVehicle?.name}</strong> (Reg: {deletingVehicle?.registrationNumber})?
            <br />
            This action cannot be undone. This soft-deletes the vehicle asset from the active registry state.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            onClick={handleDeleteConfirm}
          >
            Delete Asset
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
