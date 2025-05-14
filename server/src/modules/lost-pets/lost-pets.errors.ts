import { ErrorData, PetFinderError } from 'src/types/pet-finder.errors';

export class LostPetsError extends PetFinderError {
  constructor(code: LostPetsErrorCode, data?: ErrorData) {
    super({ code, message: dictionary[code], data });
  }
}

const dictionary = {};

type LostPetsErrorCode = keyof typeof dictionary;
