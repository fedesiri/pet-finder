import { Species } from '@prisma/client';
import * as dayjs from 'dayjs';
import { ErrorData, PetFinderError } from 'src/types/pet-finder.errors';

const SPECIES_VALUES: Species[] = Object.values(Species);
const SPECIES_STRING = SPECIES_VALUES.join(', ');
export class PetsError extends PetFinderError {
  constructor(code: PetsErrorCode, data?: ErrorData) {
    super({ code, message: dictionary[code], data });
  }
}

const dictionary = {
  'PET-600': 'QR already exist',
  'PET-601': `Invalid specie. Valid values: ${SPECIES_STRING}`,
  'PET-602': 'Auth with Firebase is required',
  'PET-603': 'Email already in use',
  'PET-604': 'Phone already in use',
  'PET-700': `Year must be between 2000 and ${dayjs().year()}`,
  'PET-701': 'Invalid date. Must be YYYY-MM-DD format.',
  'PET-702': 'User update failed',
  'PET-703': 'Pet update failed',
  'PET-800': 'qr_code is allowed.',
  'PET-801': 'No pets were found associated with this QR code.',
  'PET-802': 'User not found or user not created',
  'PET-803': 'Pet code dont exist',
  'PET-804': 'Pet code already activated',
  'PET-805': 'Address is not valid for delivery',
  'PET-806': 'Error generating QR code',
  'PET-807': 'Pet not found',
};

type PetsErrorCode = keyof typeof dictionary;
