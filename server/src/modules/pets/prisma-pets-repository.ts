import { Injectable } from '@nestjs/common';
import { LostReport, Species } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';
import { DatabaseService } from 'src/helpers/database.service';
import {
  CreatePetDto,
  CreateUserDto,
  RegisterOutputDto,
} from './dto/create-pet.dto';
import { PetWithUser } from './pets.controller';
import { PetsError } from './pets.errors';

@Injectable()
export class PetsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async isQrCodeRegistered(qrCode: string): Promise<boolean> {
    const count = await this.databaseService.pet.count({
      where: { qr_code: qrCode },
    });
    return count > 0;
  }

  async createUserWithPetTransaction(input: {
    users: CreateUserDto[];
    pet: CreatePetDto;
    qr_code: string;
  }): Promise<RegisterOutputDto> {
    return this.databaseService.$transaction(async (prisma) => {
      // 1. Crear dueños
      const created_users = await Promise.all(
        input.users.map(async (user_data) => {
          const { name, email, phone, external_id } = user_data;

          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [{ email }, { phone }, { external_id }],
            },
            include: { addresses: true },
          });

          if (existingUser) return existingUser;

          // Crear usuario
          const user = await prisma.user.create({
            data: {
              name,
              email: email || `temp-${dayjs().toISOString()}@example.com`,
              phone,
              external_id,
              password: await bcrypt.hash(user_data.password, 10),
            },
          });

          // Crear direcciones si existen
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

          return prisma.user.findUnique({
            where: { id: user.id },
            include: { addresses: true },
          });
        }),
      );

      // 2. Validar fecha (si existe)
      let birthdate: Date | null = null;
      if (input.pet.birthdate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(input.pet.birthdate)) {
          throw new PetsError('PET-701');
        }

        const parsed_date = dayjs(input.pet.birthdate, 'YYYY-MM-DD', true);

        if (!parsed_date.isValid()) {
          throw new PetsError('PET-701');
        }

        const year = parsed_date.year();
        if (year < 2000 || year > dayjs().year() + 1) {
          throw new PetsError('PET-700');
        }

        birthdate = parsed_date.toDate();
      }

      if (!Object.values(Species).includes(input.pet.species)) {
        throw new PetsError('PET-601');
      }

      // 3. Crear mascota
      const pet = await prisma.pet.create({
        data: {
          ...input.pet,
          birthdate,
          qr_code: input.qr_code,
          users: {
            connect: created_users.map((user) => ({ id: user.id })),
          },
          photos:
            input.pet.photos && input.pet.photos.length > 0
              ? {
                  create: input.pet.photos.map((url, index) => ({
                    url,
                    is_primary: index === 0,
                  })),
                }
              : undefined,
        },
        select: {
          id: true,
          qr_code: true,
          created_at: true,
          users: { select: { id: true } },
        },
      });

      return {
        pet_id: pet.id,
        qr_code: pet.qr_code,
        user_ids: pet.users.map((user) => user.id),
        created_at: pet.created_at,
      };
    });
  }

  async findPetByQr(qr_code: string): Promise<PetWithUser> {
    return this.databaseService.pet.findUnique({
      where: { qr_code },
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
}
