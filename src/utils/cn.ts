import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function for conditional class names
 * Combines clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
