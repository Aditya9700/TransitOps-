import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Switch } from '../../components/ui/Switch';
import { Lock, ShieldAlert, KeyRound, Radio } from 'lucide-react';
import { toast } from 'sonner';

export const SecurityOverviewCard: React.FC = () => {
  const { users } = useSettings();
  const [strongPassword, setStrongPassword] = useState(true);

  const activeCount = users.filter((u) => u.status === 'Active').length;
  const inactiveCount = users.filter((u) => u.status === 'Inactive').length;

  const handlePasswordToggle = () => {
    setStrongPassword(!strongPassword);
    toast.success(`Password complexity rules ${!strongPassword ? 'enforced' : 'disabled'}.`);
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm text-left">
      <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
        <Lock className="h-4.5 w-4.5 text-primary shrink-0" />
        <CardTitle className="text-sm font-bold text-slate-900">Security & Credentials Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Active/Inactive Users */}
        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-50 font-semibold text-xs">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Active Accounts</span>
            <span className="text-emerald-600 font-bold text-sm block">{activeCount} users</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Inactive Accounts</span>
            <span className="text-slate-500 font-bold text-sm block">{inactiveCount} users</span>
          </div>
        </div>

        {/* Strong password Switch */}
        <Switch
          label="Enforce Strong Password Policy"
          description="Requires special characters, numeric digits, and at least 8 symbols."
          checked={strongPassword}
          onChange={handlePasswordToggle}
        />

        {/* Security parameters */}
        <div className="space-y-3 pt-2 border-t border-slate-50 font-semibold text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <KeyRound className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-medium">Session JWT Status</span>
            </div>
            <span className="text-slate-950 font-bold">Simulator Mock Token</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-slate-400 font-medium">Backend Integration</span>
            </div>
            <span className="text-slate-950 font-bold">Pending Setup</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-slate-400 font-medium">Security Sync</span>
            </div>
            <span className="text-emerald-600 font-bold">Operational</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
