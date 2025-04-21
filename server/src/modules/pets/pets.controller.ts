import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LostReport, Prisma, Species } from '@prisma/client';
import { Envelope } from 'src/types/envelope.type';
import {
  RegisterOutputDto,
  RegisterPetWithUserDto,
} from './dto/create-pet.dto';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post('register')
  async register(
    @Body() data: RegisterPetWithUserDto,
  ): Promise<Envelope<RegisterOutputDto>> {
    const response: Envelope<RegisterOutputDto> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      response.data = await this.petsService.registerPetWithUser(data);
      return response;
    } catch (error) {
      console.error(error);
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/register controller');
      return response;
    }
  }

  @Get('qr/:code')
  async getByQrCode(
    @Param('code') code: string,
  ): Promise<Envelope<PetWithUser>> {
    const response: Envelope<PetWithUser> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      response.data = await this.petsService.getPetByQrCode(code);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/qr/:code controller');
      console.error(error);
      return response;
    }
  }

  @Post(':pet_id/lost')
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
      response.data = await this.petsService.reportPetLost({
        pet_id,
        ...data,
      });
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/:id/lost controller');
      console.error(error);
      return response;
    }
  }

  @Get('species')
  async getSpecies(): Promise<
    Envelope<{ values: string[]; labels: Record<string, string> }>
  > {
    const response: Envelope<{
      values: string[];
      labels: Record<string, string>;
    }> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      const enum_values = Object.values(Species).filter(
        (v): v is Species => typeof v === 'string',
      );

      response.data = {
        values: enum_values,
        labels: {
          DOG: 'Perro',
          CAT: 'Gato',
          BIRD: 'Ave',
          OTHER: 'Otro',
        },
      };
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/species controller');
      console.error(error);
      return response;
    }
  }
}

export type PetWithUser = Prisma.PetGetPayload<{
  include: {
    users: true;
  };
}>;
