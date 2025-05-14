import { Injectable } from '@nestjs/common';
import { ProvincesRepository } from './prisma-provinces-repository';

@Injectable()
export class ProvincesService {
  constructor(private readonly provincesRepository: ProvincesRepository) {}

  async getProvinces(input: {
    page: number;
    items_per_page: number;
    search?: string;
  }): Promise<{
    provinces: {
      id: string;
      name: string;
    }[];
    total_items: number;
  }> {
    const { page, items_per_page, search } = input;
    const { total_items } = await this.provincesRepository.countProvinces(
      search,
    );

    const provinces = await this.provincesRepository.getProvinces({
      skip: (page - 1) * items_per_page,
      take: items_per_page,
      search,
    });

    return { provinces, total_items };
  }

  async getLocalitiesByProvince(
    province_id: string,
    input: {
      page: number;
      items_per_page: number;
      search?: string;
    },
  ): Promise<{
    localities: {
      id: string;
      name: string;
      province_id: string;
    }[];
    total_items: number;
  }> {
    const { page, items_per_page, search } = input;

    const { total_items } =
      await this.provincesRepository.countLocalitiesByProvince(
        province_id,
        search,
      );

    const localities = await this.provincesRepository.getLocalitiesByProvince(
      province_id,
      {
        skip: (page - 1) * items_per_page,
        take: items_per_page,
        search,
      },
    );

    return { localities, total_items };
  }

  async getLocalityById(
    province_id: string,
    locality_id: string,
  ): Promise<{ id: string; name: string; province_id: string }> {
    const locality = await this.provincesRepository.getLocalityById(
      province_id,
      locality_id,
    );

    if (!locality) {
      throw new Error('Locality not found');
    }

    return locality;
  }
}
