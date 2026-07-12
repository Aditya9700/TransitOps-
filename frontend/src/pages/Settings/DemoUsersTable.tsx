import React, { useState, useMemo } from 'react';
import { useSettings, type DemoUser, type Role } from '../../context/SettingsContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Edit2, Trash2, Search, UserPlus, Users } from 'lucide-react';

interface DemoUsersTableProps {
  onAddClick: () => void;
  onEditClick: (user: DemoUser) => void;
  onDeleteClick: (user: DemoUser) => void;
}

export const DemoUsersTable: React.FC<DemoUsersTableProps> = ({
  onAddClick,
  onEditClick,
  onDeleteClick,
}) => {
  const { users } = useSettings();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'Fleet Manager':
        return <Badge variant="danger">Fleet Manager</Badge>;
      case 'Dispatcher':
        return <Badge variant="primary">Dispatcher</Badge>;
      case 'Safety Officer':
        return <Badge variant="warning">Safety Officer</Badge>;
      case 'Financial Analyst':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-250">Financial Analyst</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: DemoUser['status']) => {
    if (status === 'Active') {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-slate-200">Inactive</Badge>;
  };

  return (
    <div className="space-y-4 text-left">
      {/* Search & Filters Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shadow-3xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {/* Query search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Accounts</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-slate-350 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Role filter */}
          <Select
            label="Filter Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'Fleet Manager', label: 'Fleet Manager' },
              { value: 'Dispatcher', label: 'Dispatcher' },
              { value: 'Safety Officer', label: 'Safety Officer' },
              { value: 'Financial Analyst', label: 'Financial Analyst' },
            ]}
          />

          {/* Status filter */}
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </div>

        {/* Add User trigger */}
        <Button onClick={onAddClick} className="flex items-center space-x-1.5 shrink-0 h-10 w-full sm:w-auto justify-center">
          <UserPlus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Results Table */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl">
          <div className="rounded-full bg-slate-50 p-4 text-slate-400 mb-4 border border-slate-100">
            <Users className="h-10 w-10" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900">No users found</h4>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            No accounts matched your queries. Try resetting filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50">
                    {/* User profile */}
                    <TableCell className="pl-6 py-3.5">
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">{user.name}</p>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>{getRoleBadge(user.role)}</TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(user.status)}</TableCell>

                    {/* Last Login */}
                    <TableCell className="text-slate-500 text-xs font-semibold">{user.lastLogin}</TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end items-center space-x-2.5">
                        <button
                          onClick={() => onEditClick(user)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit credentials"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(user)}
                          className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete user account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
