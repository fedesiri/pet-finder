import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  calculatePagination,
  Pagination,
  PaginationType,
} from 'src/decorators/pagination.decorator';
import { Envelope } from 'src/types/envelope.type';
import { ProvincesService } from './provinces.service';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Get('')
  async getProvinces(
    @Pagination() { page, items_per_page }: PaginationType,
    @Query('search') search?: string,
  ): Promise<Envelope<{ id: string; name: string }[]>> {
    const response: Envelope<{ id: string; name: string }[]> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      const { provinces, total_items } =
        await this.provincesService.getProvinces({
          page,
          items_per_page,
          search,
        });
      response.data = provinces;
      response.pagination = calculatePagination(
        total_items,
        page,
        items_per_page,
      );
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in /provinces controller');
      console.error(error);
      return response;
    }
  }

  @Get(':province_id/localities')
  async getLocalitiesByProvince(
    @Param('province_id') province_id: string,
    @Pagination() { page, items_per_page }: PaginationType,
    @Query('search') search?: string,
  ): Promise<
    Envelope<
      {
        id: string;
        name: string;
        province_id: string;
      }[]
    >
  > {
    const response: Envelope<
      {
        id: string;
        name: string;
        province_id: string;
      }[]
    > = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      const { localities, total_items } =
        await this.provincesService.getLocalitiesByProvince(province_id, {
          page,
          items_per_page,
          search,
        });
      response.data = localities;
      response.pagination = calculatePagination(
        total_items,
        page,
        items_per_page,
      );
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in provinces/:province_id/localities controller');
      console.error(error);
      return response;
    }
  }

  @Get(':province_id/locality/:locality_id')
  async getLocalityById(
    @Param('province_id') province_id: string,
    @Param('locality_id') locality_id: string,
  ): Promise<Envelope<{ id: string; name: string; province_id: string }>> {
    const response: Envelope<{
      id: string;
      name: string;
      province_id: string;
    }> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      const locality = await this.provincesService.getLocalityById(
        province_id,
        locality_id,
      );
      response.data = locality;
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error(
              'Error in /provinces/:province_id/localities/:locality_id controller',
            );
      console.error(error);
      return response;
    }
  }
}
