import { Injectable } from '@nestjs/common';
import { LostReport } from '@prisma/client';
import { LostPetDto, LostPetsFilterDto } from './dto/get-lost-pets';
import { LostPetsRepository } from './prisma-lost-pets-repository';

@Injectable()
export class LostPetsService {
  constructor(private readonly lostPetsRepository: LostPetsRepository) {}

  async reportPetLost(data: {
    pet_id: string;
    last_seen_address: string;
    last_seen_date: Date;
    comments?: string;
    province_id: string;
    locality_id: string;
  }): Promise<LostReport> {
    return this.lostPetsRepository.createLostReport({
      pet_id: data.pet_id,
      last_seen_address: data.last_seen_address,
      last_seen_date: data.last_seen_date,
      comments: data.comments,
      province_id: data.province_id,
      locality_id: data.locality_id,
    });
  }

  async getLostPets(
    input: LostPetsFilterDto,
  ): Promise<{ lostPets: LostPetDto[]; total_items: number }> {
    const { page, items_per_page, ...filters } = input;

    const { total_items } = await this.lostPetsRepository.countLostPets(
      filters,
    );

    const lostReports = await this.lostPetsRepository.getLostPets({
      skip: (+page - 1) * +items_per_page,
      take: +items_per_page,
      ...filters,
    });

    const lostPets = lostReports.map((report) => ({
      id: report.id,
      last_seen_address: report.last_seen_address,
      last_seen_date: report.last_seen_date,
      is_active: report.is_active,
      pet: {
        id: report.pet.id,
        name: report.pet.name,
        species: report.pet.species,
        breed: report.pet.breed || undefined,
        photo_url: report.pet.photos[0]?.url || undefined,
      },
      province: report.province,
      locality: report.locality,
    }));

    return { lostPets, total_items };
  }
}
