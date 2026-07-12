import React from 'react';
import { useSettings, type Role, type AppModule, type PermissionLevel } from '../../context/SettingsContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export const PermissionMatrix: React.FC = () => {
  const { permissionMatrix, updatePermission } = useSettings();

  const roles: Role[] = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
  
  const modules: AppModule[] = [
    'Dashboard',
    'Fleet',
    'Drivers',
    'Trips',
    'Maintenance',
    'Fuel & Expenses',
    'Analytics',
    'Settings',
  ];

  const levels: PermissionLevel[] = ['No Access', 'View', 'Create', 'Edit', 'Delete', 'Manage'];

  const getLevelStyle = (level: PermissionLevel) => {
    switch (level) {
      case 'Manage':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'No Access':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'View':
        return 'bg-blue-50 text-blue-700 border-blue-250 hover:bg-blue-100';
      default:
        // Create, Edit, Delete
        return 'bg-amber-50 text-amber-750 border-amber-200 hover:bg-amber-100';
    }
  };

  const handleLevelChange = (role: Role, module: AppModule, level: PermissionLevel) => {
    updatePermission(role, module, level);
    toast.success(`Updated [${role}] permissions for [${module}] to [${level}].`);
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
        <KeyRound className="h-4.5 w-4.5 text-primary shrink-0" />
        <CardTitle className="text-sm font-bold text-slate-900">Role Permission Access Matrix</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 font-bold">App Modules</TableHead>
                {roles.map((role) => (
                  <TableHead key={role} className="text-center font-bold min-w-[140px]">
                    {role}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((mod) => (
                <TableRow key={mod} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 py-3.5 font-bold text-slate-800 text-xs">
                    {mod}
                  </TableCell>
                  {roles.map((role) => {
                    const currentLevel = permissionMatrix[role][mod];
                    return (
                      <TableCell key={role} className="text-center py-2">
                        <select
                          value={currentLevel}
                          onChange={(e) => handleLevelChange(role, mod, e.target.value as PermissionLevel)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border focus:outline-hidden transition-all duration-200 cursor-pointer text-center ${getLevelStyle(
                            currentLevel
                          )}`}
                        >
                          {levels.map((lvl) => (
                            <option key={lvl} value={lvl} className="text-slate-800 bg-white">
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
