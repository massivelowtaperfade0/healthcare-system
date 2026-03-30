/**
 * PUID Generator for Healthcare Multi-tenancy
 * Format: ORG-SERIAL-CHECK
 * Example: CIT-4K2P-9XJ2
 */

// Custom alphabet: No 0, O, I, or L to prevent human reading errors
const ALPHABET = "123456789ABCDEFGHJKMNPQRSTUVWXYZ"; 
const BASE = ALPHABET.length;

/**
 * Generates a random string of a specific length from our ALPHABET
 */
const generateRandomSegment = (length: number): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * BASE));
  }
  return result;
};

/**
 * Calculates a checksum character based on the input string.
 * This helps detect if a user swapped two characters or mistyped one.
 */
const calculateChecksum = (input: string): string => {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum = (sum * 31 + ALPHABET.indexOf(input[i])) % BASE;
  }
  return ALPHABET[sum];
};

/**
 * Main function to create the PUID
 * @param orgPrefix - 3-4 character organization code (e.g., 'CIT')
 */
export const generatePUID = (orgPrefix: string): string => {
  const prefix = orgPrefix.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  
  // Segment 1: Random identity (e.g., 4 chars)
  // Segment 2: Random identity (e.g., 4 chars)
  const dataSegment = generateRandomSegment(8);
  
  // Calculate checksum for the data segment
  const checksum = calculateChecksum(dataSegment);
  
  // Format: ORG - PART1 - PART2 + CHECKSUM
  return `${prefix}-${dataSegment.slice(0, 4)}-${dataSegment.slice(4)}${checksum}`;
};

/**
 * Validation function to check if a PUID is typed correctly
 */
export const isValidPUID = (puid: string): boolean => {
  const parts = puid.split("-");
  if (parts.length !== 3) return false;
  
  const dataWithChecksum = parts[2];
  const data = parts[1] + dataWithChecksum.slice(0, -1);
  const providedChecksum = dataWithChecksum.slice(-1);
  
  return calculateChecksum(data) === providedChecksum;
};
