import { Prisma } from '@prisma/client';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class AddressDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  zip_code?: string;

  @IsBoolean()
  is_primary: boolean;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsUUID()
  @IsNotEmpty()
  province_id: string;

  @IsString()
  @IsNotEmpty()
  locality: string;
  @IsUUID()
  @IsNotEmpty()
  locality_id: string;
}

export class UserProfileResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  addresses?: AddressDto[];
}

export type UserProfileOutputRepositoryDto = Prisma.UserGetPayload<{
  include: {
    addresses: {
      include: {
        province: {
          select: {
            id: true;
            name: true;
          };
        };
        locality: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;
