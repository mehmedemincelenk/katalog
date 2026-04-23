import { memo } from 'react';
import { Check, X } from 'lucide-react';
import Button from './Button';
import { INITIAL_STATUS_STATE } from '../data/config';

/**
 * STATUS TOGGLE COMPONENT (Diamond Standard)
 * -----------------------------------------------------------
 * A specialized binary toggle for handling Stock, Publish, etc.
 * Uses the atomic Button unit internally for consistent feel.
 */

import { StatusToggleProps } from '../types';

const StatusToggle = memo(
  ({
    label,
    value,
    onChange,
    disabled = false,
    activeColor = INITIAL_STATUS_STATE.active,
    inactiveColor = INITIAL_STATUS_STATE.danger,
  }: StatusToggleProps) => {
    return (
      <div className="flex items-center justify-between bg-white px-2.5 py-2 rounded-xl border border-stone-100/50 shadow-sm">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-tight">
          {label}
        </span>
        <div className="flex gap-1.5">
          <Button
            onClick={() => onChange(true)}
            disabled={disabled}
            mode="square"
            size="sm"
            className={`!w-7 !h-7 !p-0 !rounded-lg transition-all ${value ? activeColor : INITIAL_STATUS_STATE.inactive}`}
            icon={<Check size={14} strokeWidth={4} />}
          />
          <Button
            onClick={() => onChange(false)}
            disabled={disabled}
            mode="square"
            size="sm"
            className={`!w-7 !h-7 !p-0 !rounded-lg transition-all ${!value ? inactiveColor : INITIAL_STATUS_STATE.inactive}`}
            icon={<X size={14} strokeWidth={4} />}
          />
        </div>
      </div>
    );
  },
);

export default StatusToggle;
