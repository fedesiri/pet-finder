import { Species } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class PetPhotoDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  is_primary: boolean;
}

export class PetResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Species)
  species: Species;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsOptional()
  distinctive_marks?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthdate?: Date;

  @IsString()
  @IsNotEmpty()
  pet_code_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PetPhotoDto)
  photos: PetPhotoDto[];
}

export class UserPetsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PetResponseDto)
  pets: PetResponseDto[];
}

export type PetWithPhotosRepositoryDto = {
  id: string;
  name: string;
  species: Species;
  breed: string | null;
  color: string;
  distinctive_marks: string | null;
  birthdate: Date | null;
  pet_code_id: string;
  photos: Array<{
    id: string;
    url: string;
    is_primary: boolean;
  }>;
};
