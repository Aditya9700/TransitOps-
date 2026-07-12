import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { User, Shield, Clock, Key } from 'lucide-react';

export const CurrentUserCard: React.FC = () => {
  const { user } = useAuth();
  const { permissionMatrix } = useSettings();

  const userName = user?.name || 'Administrator';
  const userEmail = user?.email || 'admin@transitops.in';
  const userRole = user?.role || 'Fleet Manager';
  const lastLogin = '2026-07-12 15:47'; // anchor

  // Calculate number of modules this user has access to
  const permissionsCount = React.useMemo(() => {
    const rolePermissions = permissionMatrix[userRole];
    if (!rolePermissions) return 0;
    return Object.values(rolePermissions).filter((lvl) => lvl !== 'No Access').length;
  }, [userRole, permissionMatrix]);

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
        <User className="h-4.5 w-4.5 text-primary shrink-0" />
        <CardTitle className="text-sm font-bold text-slate-900">Current Session User</CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex items-center space-x-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 font-extrabold text-white text-base shadow-sm">
          {userName.split(' ').map((n) => n[0]).join('')}
        </div>
        
        {/* Meta */}
        <div className="space-y-1 font-semibold text-xs text-slate-655 flex-1">
          <h4 className="text-sm font-bold text-slate-950 leading-none">{userName}</h4>
          <span className="text-[10px] text-slate-400 block leading-none">{userEmail}</span>
          
          <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-bold text-slate-750">{userRole}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Key className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-750">{permissionsCount}/8 modules</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[9px] text-slate-400 pt-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Session start: {lastLogin}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
