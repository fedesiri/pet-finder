import { Injectable } from '@nestjs/common';
import { Pet, PetCode, Species, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/helpers/database.service';
import { CreateUserDto } from './dto/create-user-dto';
import { PetWithPhotosAndUsersRepositoryDto } from './dto/get-pet-datail.dto';
import { PetWithPhotosRepositoryDto } from './dto/get-pets-from-user';
import { UserProfileOutputRepositoryDto } from './dto/get-user-profile.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PetWithUser } from './pets.controller';
import { PetsError } from './pets.errors';

@Injectable()
export class PetsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async isQrCodeRegistered(qr_code: string): Promise<boolean> {
    const count = await this.databaseService.pet.count({
      where: { pet_code_id: qr_code },
    });
    return count > 0;
  }

  async createUserTransaction(input: {
    users: CreateUserDto[];
  }): Promise<{ user_ids: string[]; created_at: Date }> {
    return this.databaseService.$transaction(async (prisma) => {
      const created_user_ids: string[] = [];
      let created_at: Date | null = null;

      for (const user_data of input.users) {
        const { name, email, phone, external_id } = user_data;

        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { phone }, { external_id }],
          },
          select: { id: true, created_at: true },
        });

        if (existingUser) {
          created_user_ids.push(existingUser.id);
          if (!created_at) {
            created_at = existingUser.created_at;
          }
          continue;
        }

        const user = await prisma.user.create({
          data: {
            name,
            email: email,
            phone,
            external_id,
            password: await bcrypt.hash(user_data.password, 10),
          },
        });

        created_user_ids.push(user.id);

        if (!created_at) {
          created_at = user.created_at;
        }

        if (user_data.addresses.length > 0) {
          await prisma.address.createMany({
            data: user_data.addresses.map((address) => ({
              ...address,
              user_id: user.id,
              is_primary: address.is_primary ?? false,
              show_address: address.show_address ?? false,
            })),
          });
        }
      }

      if (!created_at) {
        throw new PetsError('PET-802');
      }

      return {
        user_ids: created_user_ids,
        created_at,
      };
    });
  }

  async findPetByQr(pet_code_id: string): Promise<PetWithUser> {
    return this.databaseService.pet.findUnique({
      where: { pet_code_id },
      include: {
        users: true,
      },
    });
  }

  async getUserWithAddresses(
    external_id: string,
  ): Promise<UserProfileOutputRepositoryDto> {
    return this.databaseService.user.findUnique({
      where: { external_id },
      include: {
        addresses: {
          include: {
            province: { select: { id: true, name: true } },
            locality: { select: { id: true, name: true } },
          },
          orderBy: { is_primary: 'desc' },
        },
      },
    });
  }

  async getUserPets(
    external_id: string,
  ): Promise<PetWithPhotosRepositoryDto[]> {
    return this.databaseService.pet.findMany({
      where: {
        users: {
          some: {
            external_id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        color: true,
        distinctive_marks: true,
        birthdate: true,
        pet_code_id: true,
        photos: {
          select: {
            id: true,
            url: true,
            is_primary: true,
          },
        },
      },
    });
  }

  async findUserByExternalId(
    external_id: string,
  ): Promise<{ id: string } | null> {
    return this.databaseService.user.findUnique({
      where: { external_id },
      select: { id: true },
    });
  }

  async createPetCode(): Promise<PetCode> {
    return this.databaseService.petCode.create({
      data: {},
    });
  }

  async findPetCode(code: string): Promise<PetCode & { pet?: Pet }> {
    return this.databaseService.petCode.findUnique({
      where: { id: code },
      include: { pet: true },
    });
  }

  async activatePetCode(code: string): Promise<PetCode> {
    return this.databaseService.petCode.update({
      where: { id: code },
      data: {
        activated_date: new Date(),
      },
    });
  }

  async createAddress(data: {
    user_id: string;
    street: string;
    number: string;
    apartment?: string;
    neighborhood?: string;
    zip_code?: string;
    province_id: string;
    locality_id: string;
    is_primary: boolean;
    show_address: boolean;
  }): Promise<{ id: string }> {
    const address = await this.databaseService.address.create({
      data,
    });
    return { id: address.id };
  }

  // ESTA FUNCIIONALIDAD LA VEMOS MÁS ADELANTE
  // async createCodeDeliveryRequest(data: {
  //   codeId: string;
  //   addressId: string;
  //   userId: string;
  // }): Promise<void> {
  //}

  async createPet(data: {
    name: string;
    species: Species;
    breed?: string;
    color: string;
    distinctive_marks?: string;
    birthdate?: Date;
    pet_code_id: string;
  }): Promise<Pet> {
    return this.databaseService.pet.create({
      data,
    });
  }

  async associatePetToUser(petId: string, userId: string): Promise<void> {
    await this.databaseService.pet.update({
      where: { id: petId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });
  }

  async createPetPhoto(data: {
    pet_id: string;
    url: string;
    is_primary: boolean;
  }): Promise<void> {
    await this.databaseService.petPhoto.create({
      data,
    });
  }

  async getPetWithPhotos(petId: string): Promise<PetWithPhotosRepositoryDto> {
    return this.databaseService.pet.findUnique({
      where: { id: petId },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        color: true,
        distinctive_marks: true,
        birthdate: true,
        pet_code_id: true,
        photos: {
          select: {
            id: true,
            url: true,
            is_primary: true,
          },
        },
      },
    });
  }

  async getPetDetail(
    pet_id: string,
    user_id: string,
  ): Promise<PetWithPhotosAndUsersRepositoryDto | null> {
    return this.databaseService.pet.findFirst({
      where: {
        id: pet_id,
        users: {
          some: {
            external_id: user_id,
          },
        },
      },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
            is_primary: true,
          },
          orderBy: { is_primary: 'desc' },
        },
        users: {
          include: {
            addresses: {
              include: {
                province: { select: { name: true } },
                locality: { select: { name: true } },
              },
              orderBy: { is_primary: 'desc' },
            },
          },
        },
      },
    });
  }

  async getPublicPetDetail(pet_id: string) {
    return this.databaseService.pet.findUnique({
      where: { id: pet_id },
      include: {
        photos: {
          select: {
            id: true,
            url: true,
            is_primary: true,
          },
          orderBy: { is_primary: 'desc' },
        },
        users: {
          include: {
            addresses: {
              include: {
                province: { select: { name: true } },
                locality: { select: { name: true } },
              },
              orderBy: { is_primary: 'desc' },
            },
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { phone },
    });
  }

  async updateUser(user_id: string, data: UpdateUserDto): Promise<User> {
    return this.databaseService.user.update({
      where: { external_id: user_id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
  }

  async petExists(pet_id: string, user_id: string): Promise<boolean> {
    const pet = await this.databaseService.pet.findFirst({
      where: {
        id: pet_id,
        users: {
          some: {
            external_id: user_id,
          },
        },
      },
    });
    return !!pet;
  }

  async updatePet(update_data: {
    pet_id: string;
    data: Partial<UpdatePetDto>;
  }): Promise<Pet> {
    const { pet_id, data } = update_data;
    return this.databaseService.pet.update({
      where: { id: pet_id },
      data: {
        ...data,
      },
    });
  }
}
