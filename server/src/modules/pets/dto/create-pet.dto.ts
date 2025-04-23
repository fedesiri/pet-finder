import { Species } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4,10}$/, {
    message: 'zip_code must be between 4 and 10 digits',
  })
  zip_code?: string;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @IsBoolean()
  @IsOptional()
  show_address?: boolean;

  @IsUUID()
  province_id: string;

  @IsUUID()
  locality_id: string;
}
export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  external_id: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  addresses?: AddressDto[];
}

export class CreatePetDto {
  @IsString()
  name: string;

  @IsEnum(Species)
  species: Species;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  color: string;

  @IsString()
  @IsOptional()
  distinctive_marks?: string;

  @IsDateString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birthdate must be YYYY-MM-DD format',
  })
  birthdate?: string;
}

export class RegisterPetWithUserDto {
  pet: CreatePetDto;
  users: CreateUserDto[];
  @IsString()
  qr_code: string;
}

export class RegisterOutputDto {
  @IsString()
  pet_id: string;

  @IsString()
  qr_code: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  user_ids: string[];

  @IsDateString()
  created_at: Date;
}
