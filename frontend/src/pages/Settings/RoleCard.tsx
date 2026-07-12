import React, { useState } from 'react';
import { useSettings, type Role, type AppModule } from '../../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ShieldCheck, ChevronRight, UserCheck, AlertCircle } from 'lucide-react';

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  'Fleet Manager': 'Complete administrative access. Manages vehicles, drivers, schedules, dispatches, budgets, and configurations.',
  Dispatcher: 'Coordinates logistics dispatches. Creates, logs, and closes trips. Accesses fleet registry in read-only mode.',
  'Safety Officer': 'Monitors regulatory driver compliance, documents validity, driver scorecards, and logs maintenance servicing plans.',
  'Financial Analyst': 'Audits operational expenditures, fuel receipts, tolls, and parses executive performance dashboards.',
};

export const RoleCard: React.FC = () => {
  const { permissionMatrix, users } = useSettings();
  const [selectedRole, setSelectedRole] = useState<Role>('Fleet Manager');

  const rolesList: Role[] = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];

  // Calculate dynamic data
  const roleSummaries = React.useMemo(() => {
    return rolesList.map((role) => {
      const rolePermissions = permissionMatrix[role];
      const accessibleModules = Object.entries(rolePermissions)
        .filter(([_, lvl]) => lvl !== 'No Access')
        .map(([mod]) => mod as AppModule);

      const userCount = users.filter((u) => u.role === role).length;

      return {
        role,
        count: accessibleModules.length,
        modules: accessibleModules,
        userCount,
        pct: (accessibleModules.length / 8) * 100,
      };
    });
  }, [permissionMatrix, users]);

  const selectedSummary = roleSummaries.find((s) => s.role === selectedRole);

  return (
    <div className="space-y-6 text-left">
      {/* 1. Dynamic Role Details Panel */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 p-4">
          <CardTitle className="text-sm font-bold text-slate-900">Role Details & Accessible Scope</CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex flex-col md:flex-row md:items-start gap-6">
          {/* Left list trigger selectors */}
          <div className="w-full md:w-[180px] shrink-0 space-y-1">
            {rolesList.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedRole === role
                    ? 'bg-slate-900 text-white shadow-3xs'
                    : 'bg-slate-50 text-slate-655 hover:bg-slate-100'
                }`}
              >
                <span>{role}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Right details content details */}
          {selectedSummary && (
            <div className="flex-1 space-y-4 font-semibold text-xs text-slate-655">
              <div className="pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-950 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  <span>{selectedSummary.role}</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                  {ROLE_DESCRIPTIONS[selectedSummary.role]}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Linked Users</span>
                  <span className="text-slate-900 font-bold text-xs">{selectedSummary.userCount} active accounts</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Permission Level</span>
                  <span className="text-emerald-600 font-bold text-xs">
                    {selectedSummary.count === 8 ? 'Complete Access' : `${selectedSummary.count}/8 Modules`}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Accessible Modules</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSummary.modules.length > 0 ? (
                    selectedSummary.modules.map((mod) => {
                      const level = permissionMatrix[selectedSummary.role][mod];
                      return (
                        <span
                          key={mod}
                          className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
                            level === 'Manage'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}
                        >
                          {mod} ({level})
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-slate-400 font-medium italic flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      No modules accessible.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Role Summary Progress Bars */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 p-4 flex flex-row items-center space-x-2">
          <UserCheck className="h-4.5 w-4.5 text-primary shrink-0" />
          <CardTitle className="text-sm font-bold text-slate-900">Permissions Progress Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {roleSummaries.map((summary) => (
            <div key={summary.role} className="space-y-1.5 font-semibold text-xs text-slate-700">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-900 font-bold">{summary.role}</span>
                <span className="text-slate-400 font-medium">{summary.count} Modules allowed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                <div
                  style={{ width: `${summary.pct}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    summary.pct === 100 ? 'bg-emerald-500' : 'bg-primary'
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
