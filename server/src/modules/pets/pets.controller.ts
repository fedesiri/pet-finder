import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Prisma, Species } from '@prisma/client';
import { CurrentUser } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { Envelope } from 'src/types/envelope.type';
import { RegisterUserDto, RegisterUserOutputDto } from './dto/create-user-dto';
import { PetDetailDto } from './dto/get-pet-datail.dto';
import { PetResponseDto } from './dto/get-pets-from-user';
import { UserProfileResponseDto } from './dto/get-user-profile.dto';
import { RegisterPetWithCodeDto, RequestPetCodeDto } from './dto/pet-code.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  // User
  @Post('register-user')
  async register(
    @Body() data: RegisterUserDto,
  ): Promise<Envelope<RegisterUserOutputDto>> {
    const response: Envelope<RegisterUserOutputDto> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      response.data = await this.petsService.registerUser(data);
      return response;
    } catch (error) {
      console.error(error);
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/register-user controller');
      return response;
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(
    @CurrentUser() user: { id: string },
  ): Promise<Envelope<UserProfileResponseDto>> {
    const response: Envelope<UserProfileResponseDto> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };

    try {
      response.data = await this.petsService.getUserProfile(user.id);

      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/profile controller');
      console.error(error);
      return response;
    }
  }

  @Patch('update-user')
  @UseGuards(AuthGuard)
  async updateUser(
    @CurrentUser() user: { id: string },
    @Body() data: UpdateUserDto,
  ): Promise<Envelope<{ updatedFields: Partial<UpdateUserDto> }>> {
    const response = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      response.data = await this.petsService.updateUser(user.id, data);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/update-user controller');
      console.error(error);
      return response;
    }
  }

  // Pet
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

  @Get('')
  @UseGuards(AuthGuard)
  async getUserPets(
    @CurrentUser() user: { id: string },
  ): Promise<Envelope<PetResponseDto[]>> {
    const response: Envelope<PetResponseDto[]> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };

    try {
      response.data = await this.petsService.getUserPets(user.id);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error ? error : new Error('Error in /pets controller');
      console.error(error);
      return response;
    }
  }

  @Post('request-code')
  @UseGuards(AuthGuard)
  async requestPetCode(
    @CurrentUser() user: { id: string },
    @Body() data: RequestPetCodeDto,
  ): Promise<Envelope<{ code: string; qr_image: string }>> {
    const response = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      response.data = await this.petsService.requestPetCode(user.id, data);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/request-code controller');
      console.error(error);
      return response;
    }
  }

  @Get('code/:code/status')
  async checkCodeStatus(
    @Param('code') code: string,
  ): Promise<Envelope<{ is_activated: boolean }>> {
    const response = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      response.data = await this.petsService.checkCodeStatus(code);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/code/:code/status controller');
      console.error(error);
      return response;
    }
  }

  @Post('register-with-code')
  async registerPetWithCode(
    @Body() data: RegisterPetWithCodeDto,
  ): Promise<Envelope<PetResponseDto>> {
    const response = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };
    try {
      response.data = await this.petsService.registerPetWithCode(data);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/register-with-code controller');
      console.error(error);
      return response;
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getPetDetail(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<Envelope<PetDetailDto>> {
    const response: Envelope<PetDetailDto> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };

    try {
      response.data = await this.petsService.getPetDetail(id, user.id);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/:id controller');
      console.error(error);
      return response;
    }
  }

  @Get('public/:id')
  async getPublicPetDetail(
    @Param('id') id: string,
  ): Promise<Envelope<PetDetailDto>> {
    const response: Envelope<PetDetailDto> = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };

    try {
      response.data = await this.petsService.getPublicPetDetail(id);
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in pets/public/:id controller');
      console.error(error);
      return response;
    }
  }

  @Patch(':pet_id')
  @UseGuards(AuthGuard)
  async updatePet(
    @Param('pet_id') pet_id: string,
    @CurrentUser() user: { id: string },
    @Body() data: UpdatePetDto,
  ): Promise<Envelope<{ updatedFields: Partial<UpdatePetDto> }>> {
    const response = {
      success: true,
      data: null,
      error: null,
      pagination: null,
    };

    try {
      response.data = await this.petsService.updatePet({
        pet_id,
        user_id: user.id,
        data,
      });
      return response;
    } catch (error) {
      response.success = false;
      response.error =
        error instanceof Error
          ? error
          : new Error('Error in PATCH pets/:pet_id controller');
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
