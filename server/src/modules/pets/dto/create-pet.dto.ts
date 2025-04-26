import { Species } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

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

  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true, message: 'Each photo must be a valid URL' })
  @MaxLength(5, { message: 'Maximum 5 photos allowed' })
  @IsOptional()
  photos?: string[];

  @IsDateString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birthdate must be YYYY-MM-DD format',
  })
  birthdate?: string;
}

export class RegisterPetDto {
  pet: CreatePetDto;
  @IsString()
  pet_code_id: string;
}

export class RegisterPetOutputDto {
  @IsString()
  pet_id: string;

  @IsString()
  pet_code_id: string;

  @IsDateString()
  created_at: Date;
}
