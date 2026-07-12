import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { Compass, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'Fleet Manager',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      const success = await login(data.email, data.password, data.role);
      if (success) {
        toast.success(`Welcome back! Logged in as ${data.role}`);
        navigate('/dashboard');
      } else {
        const err = 'Invalid email/password or role combination.';
        setAuthError(err);
        toast.error(err);
      }
    } catch (e) {
      const err = 'Something went wrong. Please try again.';
      setAuthError(err);
      toast.error(err);
    }
  };

  const handleDemoFill = (email: string, role: UserRole) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password@123', { shouldValidate: true });
    setValue('role', role, { shouldValidate: true });
    toast.info(`Filled credentials for ${role}`);
  };

  const roleOptions = [
    { value: 'Fleet Manager', label: 'Fleet Manager' },
    { value: 'Dispatcher', label: 'Dispatcher' },
    { value: 'Safety Officer', label: 'Safety Officer' },
    { value: 'Financial Analyst', label: 'Financial Analyst' },
  ];

  const demoAccounts = [
    { email: 'fleet.manager@transitops.dev', role: 'Fleet Manager' as UserRole, label: 'Manager' },
    { email: 'dispatcher@transitops.dev', role: 'Dispatcher' as UserRole, label: 'Dispatcher' },
    { email: 'safety@transitops.dev', role: 'Safety Officer' as UserRole, label: 'Safety' },
    { email: 'finance@transitops.dev', role: 'Financial Analyst' as UserRole, label: 'Finance' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left Panel - Dark Background Brand Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-xs">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">TransitOps</span>
            <span className="text-xs text-slate-400 block tracking-widest font-semibold uppercase leading-none mt-0.5">Smart Transport Operations Platform</span>
          </div>
        </div>

        {/* Feature Context Content */}
        <div className="my-auto max-w-lg space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            One Centralized Platform, <br />
            Four Specialized Roles.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            TransitOps streamlines fleet tracking, driver schedules, safety audits, and operational expense logs.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="flex items-start space-x-3 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Full Compliance</h4>
                <p className="text-xs text-slate-400 mt-1">Expired licenses and vehicle maintenance rules enforced automatically.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
              <UserCheck className="mt-0.5 h-5 w-5 text-primary shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Role-Based Access</h4>
                <p className="text-xs text-slate-400 mt-1">Distinct controls configured specifically for managers, safety officers, and analysts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-sm text-slate-500">
          TransitOps &copy; 2026. Built for high efficiency.
        </div>
      </div>

      {/* Right Panel - Auth Card Container */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile Header (Only visible on small viewports) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">TransitOps</span>
          </div>

          <div className="text-left">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h3>
            <p className="text-sm text-slate-500 mt-2">Enter your credentials or click a demo profile below.</p>
          </div>

          {/* Form error handler */}
          {authError && (
            <div className="flex items-center space-x-2.5 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-danger animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@transitops.com"
              error={errors.email?.message}
              disabled={isSubmitting}
              {...register('email')}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register('password')}
            />

            <Select
              label="Role Access"
              id="role"
              options={roleOptions}
              error={errors.role?.message}
              disabled={isSubmitting}
              {...register('role')}
            />

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-sm border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                  disabled={isSubmitting}
                  {...register('rememberMe')}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-primary hover:text-primary-hover">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="border-t border-slate-200 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 text-left">
              Quick Connect Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemoFill(account.email, account.role)}
                  className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 hover:bg-slate-50 text-left transition-all duration-200 cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-primary">
                    {account.label}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
