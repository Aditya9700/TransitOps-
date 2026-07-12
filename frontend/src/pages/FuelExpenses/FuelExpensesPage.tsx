import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Wallet } from 'lucide-react';

export const FuelExpensesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fuel & Expenses</h2>
        <p className="text-sm text-slate-500 mt-1">Audit operational expenses, tolls, and fuel consumption receipts.</p>
      </div>

      <Card className="bg-white">
        <CardHeader className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-4 text-primary">
            <Wallet className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl">Fuel & Expenses Module</CardTitle>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Coming in next implementation. Here you will audit operational cost parameters, log gas fill-ups, and track tolls per vehicle.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};
