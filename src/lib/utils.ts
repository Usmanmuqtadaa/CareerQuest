import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any) {
  if (!date) return 'N/A';
  try {
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (typeof date?.toDate === 'function') {
      d = date.toDate();
    } else {
      d = new Date(date);
    }
    
    if (isNaN(d.getTime())) return 'N/A';
    
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'N/A';
  }
}
