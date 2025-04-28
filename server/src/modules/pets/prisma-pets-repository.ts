import { Injectable } from '@nestjs/common';
import { LostReport } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';
import { DatabaseService } from 'src/helpers/database.service';
import { CreateUserDto } from './dto/create-user-dto';
import { UserProfileOutputRepositoryDto } from './dto/get-user-profile.dto';
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

  // ARMAR REGISTRO MASCOTA.
  // async createPetTransaction(input: {
  //   users: [USER_IDS_DUEÑOS];
  //   pet: CreatePetDto;
  //   qr_code: string;
  // }): Promise<RegisterPetOutputDto> {
  //   return this.databaseService.$transaction(async (prisma) => {

  //     // 2. Validar fecha (si existe)
  //     let birthdate: Date | null = null;
  //     if (input.pet.birthdate) {
  //       if (!/^\d{4}-\d{2}-\d{2}$/.test(input.pet.birthdate)) {
  //         throw new PetsError('PET-701');
  //       }

  //       const parsed_date = dayjs(input.pet.birthdate, 'YYYY-MM-DD', true);

  //       if (!parsed_date.isValid()) {
  //         throw new PetsError('PET-701');
  //       }

  //       const year = parsed_date.year();
  //       if (year < 2000 || year > dayjs().year() + 1) {
  //         throw new PetsError('PET-700');
  //       }

  //       birthdate = parsed_date.toDate();
  //     }

  //     if (!Object.values(Species).includes(input.pet.species)) {
  //       throw new PetsError('PET-601');
  //     }

  //     // 3. Crear mascota
  //     const pet = await prisma.pet.create({
  //       data: {
  //         ...input.pet,
  //         birthdate,
  //         qr_code: input.qr_code,
  //         users: {
  //           connect: created_users.map((user) => ({ id: user.id })),
  //         },
  //         photos:
  //           input.pet.photos && input.pet.photos.length > 0
  //             ? {
  //                 create: input.pet.photos.map((url, index) => ({
  //                   url,
  //                   is_primary: index === 0,
  //                 })),
  //               }
  //             : undefined,
  //       },
  //       select: {
  //         id: true,
  //         qr_code: true,
  //         created_at: true,
  //         users: { select: { id: true } },
  //       },
  //     });

  //     return {
  //       pet_id: pet.id,
  //       qr_code: pet.qr_code,
  //       user_ids: pet.users.map((user) => user.id),
  //       created_at: pet.created_at,
  //     };
  //   });
  // }

  async findPetByQr(pet_code_id: string): Promise<PetWithUser> {
    return this.databaseService.pet.findUnique({
      where: { pet_code_id },
      include: {
        users: true,
      },
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

  async getUserWithAddresses(
    external_id: string,
  ): Promise<UserProfileOutputRepositoryDto> {
    return this.databaseService.user.findUnique({
      where: { external_id },
      include: {
        addresses: {
          include: {
            province: { select: { name: true } },
            locality: { select: { name: true } },
          },
          orderBy: { is_primary: 'desc' },
        },
      },
    });
  }
}
