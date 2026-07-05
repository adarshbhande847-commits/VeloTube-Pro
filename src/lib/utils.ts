import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeFilename(name: string): string {
  // Automatically strip out or replace OS-forbidden characters
  return name.replace(/[\\/:*?"<>|]/g, '-').trim();
}
