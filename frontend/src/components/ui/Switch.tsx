import React from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  ...props
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
      <div className="flex flex-col text-left space-y-0.5 max-w-[80%]">
        <span className="text-xs font-bold text-slate-800 select-none">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-slate-400 font-medium leading-normal">
            {description}
          </span>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-[16px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
      </label>
    </div>
  );
};
