import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LostReport } from '@prisma/client';
import {
  calculatePagination,
  Pagination,
  PaginationType,
} from 'src/decorators/pagination.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { Envelope } from 'src/types/envelope.type';
import { LostPetDto, LostPetsFilterDto } from './dto/get-lost-pets';
import { LostPetsService } from './lost-pets.service';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post(':pet_id')
  async reportLost(
    @Param('pet_id') pet_id: string,
    @Body()
    data: {
      last_seen_address: string;
      last_seen_date: Date;
      province_id: string;
      locality_id: string;
      comments?: string;
    },
  ): Promise<Envelope<LostReport>> {
    const response: Envelope<LostReport> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };

    try {
      response.data = await this.lostPetsService.reportPetLost({
        pet_id,
        ...data,
      });
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in lost-pets/:id controller');
      console.error(error);
      return response;
    }
  }

  @Get('')
  @UseGuards(AuthGuard)
  async getLostPets(
    @Pagination() { page, items_per_page }: PaginationType,
    @Query() filters: LostPetsFilterDto,
  ): Promise<Envelope<LostPetDto[]>> {
    const response: Envelope<LostPetDto[]> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };

    try {
      const { lostPets, total_items } = await this.lostPetsService.getLostPets({
        page,
        items_per_page,
        ...filters,
      });

      response.data = lostPets;
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
          : new Error('Error in lost-pets controller');
      console.error(error);
      return response;
    }
  }
}
