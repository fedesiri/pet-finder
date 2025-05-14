import { Injectable } from '@nestjs/common';
import { LostReport } from '@prisma/client';
import * as dayjs from 'dayjs';
import { DatabaseService } from 'src/helpers/database.service';
import {
  CountLostPetsFiltersDto,
  GetLostPetsInputDto,
  LostPetDto,
} from './dto/get-lost-pets';

@Injectable()
export class LostPetsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUserByExternalId(
    external_id: string,
  ): Promise<{ id: string } | null> {
    return this.databaseService.user.findUnique({
      where: { external_id },
      select: { id: true },
    });
  }

  async createLostReport(data: {
    pet_id: string;
    last_seen_address: string;
    last_seen_date: Date;
    province_id: string;
    locality_id: string;
    comments?: string;
  }): Promise<LostReport> {
    return this.databaseService.lostReport.create({
      data: {
        pet_id: data.pet_id,
        last_seen_address: data.last_seen_address,
        last_seen_date: dayjs(data.last_seen_date).toDate(),
        province_id: data.province_id,
        locality_id: data.locality_id,
        comments: data.comments,
        is_active: true,
      },
    });
  }

  async countLostPets(
    filters: CountLostPetsFiltersDto,
  ): Promise<{ total_items: number }> {
    const total_items = await this.databaseService.lostReport.count({
      where: {
        is_active: filters.is_active ?? true,
        province_id: filters.province_id,
        locality_id: filters.locality_id,
        pet: {
          species: filters.species,
          breed: filters.breed
            ? { contains: filters.breed, mode: 'insensitive' }
            : undefined,
          name: filters.name
            ? { contains: filters.name, mode: 'insensitive' }
            : undefined,
        },
      },
    });

    return { total_items };
  }

  async getLostPets(input: GetLostPetsInputDto): Promise<LostPetDto[]> {
    const { skip, take, ...filters } = input;

    return this.databaseService.lostReport.findMany({
      where: {
        is_active: filters.is_active ?? true,
        province_id: filters.province_id,
        locality_id: filters.locality_id,
        pet: {
          species: filters.species,
          breed: filters.breed
            ? { contains: filters.breed, mode: 'insensitive' }
            : undefined,
          name: filters.name
            ? { contains: filters.name, mode: 'insensitive' }
            : undefined,
        },
      },
      include: {
        pet: {
          include: {
            photos: {
              where: {
                is_primary: true,
              },
              take: 1,
            },
          },
        },
        province: true,
        locality: true,
      },
      orderBy: {
        last_seen_date: 'desc',
      },
      skip,
      take,
    });
  }
}
