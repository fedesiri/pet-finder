import { Injectable } from '@nestjs/common';
import { LostReport } from '@prisma/client';
import { RegisterUserDto, RegisterUserOutputDto } from './dto/create-user-dto';
import { PetWithUser } from './pets.controller';
import { PetsError } from './pets.errors';
import { PetsRepository } from './prisma-pets-repository';

@Injectable()
export class PetsService {
  constructor(private readonly petsRepository: PetsRepository) {}

  async registerUser(input: RegisterUserDto): Promise<RegisterUserOutputDto> {
    const { users } = input;

    if (!users.some((user) => user.external_id)) {
      throw new PetsError('PET-602');
    }

    users.forEach((user) => {
      if (user.addresses && user.addresses.length > 0) {
        const primary_addresses = user.addresses.filter(
          (addr) => addr.is_primary,
        );
        if (primary_addresses.length === 0) {
          user.addresses[0].is_primary = true;
        }
      }
    });

    const result = await this.petsRepository.createUserTransaction({
      users,
    });

    return {
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
