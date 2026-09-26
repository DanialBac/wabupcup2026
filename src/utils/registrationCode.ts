import { RegistrationItem } from '../types';

/**
 * Generates a strictly unique, sequential registration code for a tournament category.
 * Format: WBC-[CATEGORY]-[001] (e.g. WBC-SMA-001, WBC-SMP-002, WBC-SD-001)
 *
 * Guarantees:
 * 1. Checks all existing registration codes across existing records.
 * 2. Parses maximum sequence number for that category.
 * 3. Never produces a duplicate code, even if records were deleted or gaps exist.
 * 4. Case-insensitive and whitespace-safe.
 */
export function generateUniqueRegCode(
  category: string,
  existingList: (RegistrationItem | { regCode?: string; category?: string })[] = []
): string {
  const normCat = (category || 'UMUM').trim().toUpperCase();
  const prefix = `WBC-${normCat}-`;

  const existingCodes = new Set<string>();
  let maxSeq = 0;

  if (Array.isArray(existingList)) {
    for (const item of existingList) {
      if (!item) continue;
      const code = typeof item.regCode === 'string' ? item.regCode.trim().toUpperCase() : '';
      if (!code) continue;

      existingCodes.add(code);

      // Check if code matches prefix format WBC-[CATEGORY]-[NUMBER]
      if (code.startsWith(prefix)) {
        const numPart = code.slice(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    }
  }

  // Next sequence starts at least at maxSeq + 1 (or 1 if no existing items)
  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(3, '0')}`;

  // Safeguard: increment until guaranteed unused code is found
  while (existingCodes.has(candidate)) {
    nextSeq++;
    candidate = `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }

  return candidate;
}
