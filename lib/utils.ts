import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Serializes Firestore data so it can be safely passed to client components
 * Converts Timestamp objects to ISO strings
 */
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item)) as unknown as T;
  }
  
  if (typeof data === 'object') {
    if ('toDate' in data && typeof data.toDate === 'function') {
      // This is a Timestamp object
      return data.toDate().toISOString() as unknown as T;
    }
    
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializeData((data as Record<string, any>)[key]);
      }
    }
    return result as T;
  }
  
  return data;
}
