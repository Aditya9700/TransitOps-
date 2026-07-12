import React, { useState } from 'react';
import { useSettings, type DemoUser } from '../../context/SettingsContext';
import { SettingsForm } from './SettingsForm';
import { PreferenceCard } from './PreferenceCard';
import { PermissionMatrix } from './PermissionMatrix';
import { RoleCard } from './RoleCard';
import { CurrentUserCard } from './CurrentUserCard';
import { SystemInfoCard } from './SystemInfoCard';
import { SecurityOverviewCard } from './SecurityOverviewCard';
import { DemoUsersTable } from './DemoUsersTable';
import { UserDialog } from './UserDialog';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Info, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { deleteUser } = useSettings();

  // User Dialog state
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DemoUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<DemoUser | null>(null);

  const handleAddUserClick = () => {
    setEditingUser(null);
    setIsUserOpen(true);
  };

  const handleEditUserClick = (user: DemoUser) => {
    setEditingUser(user);
    setIsUserOpen(true);
  };

  const handleDeleteUserConfirm = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      toast.success(`User account for ${deletingUser.name} deleted.`);
      setDeletingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-left pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Role Management</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure application preferences and manage role-based permissions.
        </p>
      </div>

      {/* Main Settings & Security Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - General settings & switches (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <SettingsForm />
          <PreferenceCard />
        </div>

        {/* Right Column - User details, system info, security (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CurrentUserCard />
          <SecurityOverviewCard />
          <SystemInfoCard />

          {/* Business rules card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-start space-x-3.5 shadow-2xs text-left">
            <div className="p-1.5 bg-blue-50 text-primary rounded-lg shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 font-medium">
              <h4 className="text-sm font-bold text-slate-950">RBAC System Mappings</h4>
              <div className="text-xs text-slate-655 space-y-1.5 leading-relaxed">
                <p>
                  ✓ <strong className="text-slate-900">Fleet Manager</strong> has complete administrative read/write access.
                </p>
                <p>
                  ✓ <strong className="text-slate-900">Dispatcher</strong> executes dispatches but has restricted dashboard/analytics editing.
                </p>
                <p>
                  ✓ <strong className="text-slate-900">Safety Officer</strong> manages safety parameters, scores, and shop tasks.
                </p>
                <p>
                  ✓ <strong className="text-slate-900">Financial Analyst</strong> reviews fuel refuels and charts operational margins.
                </p>
                <p>
                  ✓ Permissions will be enforced globally after final backend sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Based Access Control Matrix */}
      <div className="pt-4 border-t border-slate-100">
        <PermissionMatrix />
      </div>

      {/* Role Details summaries & lookup cards */}
      <RoleCard />

      {/* Demo Users table listings */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <div className="text-left">
          <h3 className="text-lg font-bold text-slate-900">Demo Account Profiles</h3>
          <p className="text-xs text-slate-400">Configure demo credentials and role relationships.</p>
        </div>
        <DemoUsersTable
          onAddClick={handleAddUserClick}
          onEditClick={handleEditUserClick}
          onDeleteClick={setDeletingUser}
        />
      </div>

      {/* User Add/Edit Dialog modal */}
      <UserDialog
        isOpen={isUserOpen}
        onClose={() => setIsUserOpen(false)}
        editingUser={editingUser}
      />

      {/* User Soft-Delete overlay modal */}
      <Dialog isOpen={!!deletingUser} onClose={() => setDeletingUser(null)}>
        <DialogHeader>
          <DialogTitle className="text-danger flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5" />
            <span>Confirm Deletion</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user account for <strong>{deletingUser?.name}</strong>?
            <br />
            This will permanently remove the demo profile.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setDeletingUser(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDeleteUserConfirm}>
            Delete User Account
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
export default SettingsPage;
