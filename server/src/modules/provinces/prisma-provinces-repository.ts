import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/helpers/database.service';

@Injectable()
export class ProvincesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async countProvinces(search?: string): Promise<{
    total_items: number;
  }> {
    const total_items = await this.databaseService.province.count({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
    });

    return { total_items };
  }

  async getProvinces(input: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<{ id: string; name: string }[]> {
    const { skip, take, search } = input;
    return this.databaseService.province.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take,
    });
  }

  async countLocalitiesByProvince(
    province_id: string,
    search?: string,
  ): Promise<{ total_items: number }> {
    const total_items = await this.databaseService.locality.count({
      where: {
        province_id,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
    });

    return { total_items };
  }

  async getLocalitiesByProvince(
    province_id: string,
    options: {
      skip: number;
      take: number;
      search?: string;
    },
  ): Promise<
    {
      id: string;
      name: string;
      province_id: string;
    }[]
  > {
    const { skip, take, search } = options;

    return this.databaseService.locality.findMany({
      select: {
        id: true,
        name: true,
        province_id: true,
      },
      where: {
        province_id,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take,
    });
  }

  async getLocalityById(
    province_id: string,
    locality_id: string,
  ): Promise<{ id: string; name: string; province_id: string } | null> {
    return this.databaseService.locality.findUnique({
      where: {
        id: locality_id,
        province_id,
      },
      select: {
        id: true,
        name: true,
        province_id: true,
      },
    });
  }
}
