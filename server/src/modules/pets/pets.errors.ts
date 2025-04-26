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
  'PET-700': `Year must be between 2000 and ${dayjs().year()}`,
  'PET-701': 'Invalid date. Must be YYYY-MM-DD format.',
  'PET-800': 'qr_code is allowed.',
  'PET-801': 'No pets were found associated with this QR code.',
  'PET-802': 'User not found or user not created',
};

type PetsErrorCode = keyof typeof dictionary;
