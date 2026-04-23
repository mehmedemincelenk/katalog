import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * CN (Class Name Merger) - The Vibe Coding Engine
 * -----------------------------------------------------------
 * Combines classes using clsx and intelligently merges Tailwind
 * classes using tailwind-merge to prevent conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
