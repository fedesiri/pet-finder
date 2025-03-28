import { Injectable } from '@nestjs/common';
import { LostReport } from '@prisma/client';
import {
  RegisterOutputDto,
  RegisterPetWithUserDto,
} from './dto/create-pet.dto';
import { PetWithUser } from './pets.controller';
import { PetsError } from './pets.errors';
import { PetsRepository } from './prisma-pets-repository';

@Injectable()
export class PetsService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async registerPetWithUser(
    input: RegisterPetWithUserDto,
  ): Promise<RegisterOutputDto> {
    const { users, pet, qr_code } = input;
    const qr_code_registered = await this.petsRepository.isQrCodeRegistered(
      qr_code,
    );
    if (qr_code_registered) {
      throw new PetsError('PET-600');
    }

    const result = await this.petsRepository.createUserWithPetTransaction({
      users,
      pet,
      qr_code,
    });

    return {
      pet_id: result.pet_id,
      qr_code: result.qr_code,
      user_ids: result.user_ids.map((id) => id),
      created_at: result.created_at,
    };
  }

  async getPetByQrCode(qr_code: string): Promise<PetWithUser> {
    if (!qr_code) {
      throw new PetsError('PET-800');
    }
    const pet = await this.petsRepository.findPetByQr(qr_code);
    if (!pet) {
      throw new PetsError('PET-801');
    }

    return pet;
  }

  async reportPetLost(data: {
    pet_id: string;
    last_seen_address: string;
    last_seen_date: Date;
    comments?: string;
    province_id: string;
    locality_id: string;
  }): Promise<LostReport> {
    return this.petsRepository.createLostReport({
      pet_id: data.pet_id,
      last_seen_address: data.last_seen_address,
      last_seen_date: data.last_seen_date,
      comments: data.comments,
      province_id: data.province_id,
      locality_id: data.locality_id,
    });
  }
}
