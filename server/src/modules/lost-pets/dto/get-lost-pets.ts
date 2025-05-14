import { Species } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class LostPetDto {
  @IsString()
  id: string;

  @IsString()
  last_seen_address: string;

  @IsDate()
  @Type(() => Date)
  last_seen_date: Date;

  @IsBoolean()
  is_active: boolean;

  pet: PetDto;
  province: ProvinceDto;
  locality: LocalityDto;
}

export class PetDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEnum(Species)
  species: Species;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsUrl()
  photo_url?: string;

  @IsOptional()
  photos?: Array<{
    url: string;
    is_primary: boolean;
  }>;
}

export class LostPetsFilterDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean = true;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  province_id?: string;

  @IsOptional()
  @IsString()
  locality_id?: string;

  @IsOptional()
  @IsEnum(Species)
  species?: Species;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  items_per_page?: number;
}

export class ProvinceDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class LocalityDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class CountLostPetsFiltersDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  province_id?: string;

  @IsOptional()
  @IsString()
  locality_id?: string;

  @IsOptional()
  @IsEnum(Species)
  species?: Species;

  @IsOptional()
  @IsString()
  breed?: string;
}

export class GetLostPetsInputDto extends CountLostPetsFiltersDto {
  @IsNumber()
  @Type(() => Number)
  skip: number;

  @IsNumber()
  @Type(() => Number)
  take: number;
}
