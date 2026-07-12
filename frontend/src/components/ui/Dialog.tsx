import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 cursor-default" 
        onClick={onClose}
      />
      {/* Modal Container Card */}
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-lg z-10 max-h-[90vh] overflow-y-auto animate-fade-in flex flex-col">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 text-left mb-5">
    {children}
  </div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold leading-none tracking-tight text-slate-900 ${className}`}>
    {children}
  </h3>
);

export const DialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 mt-1.5 ${className}`}>
    {children}
  </p>
);

export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2.5 mt-6 border-t border-slate-100 pt-4 ${className}`}>
    {children}
  </div>
);
