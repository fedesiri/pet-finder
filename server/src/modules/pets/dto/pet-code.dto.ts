import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RequestPetCodeDto {
  @IsUUID()
  @IsOptional()
  address_id?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  zip_code?: string;

  @IsString()
  @IsNotEmpty()
  province_id: string;

  @IsString()
  @IsNotEmpty()
  locality_id: string;
}

export class RegisterPetWithCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsOptional()
  distinctive_marks?: string;

  @IsString()
  @IsOptional()
  birthdate?: string;

  @IsString({ each: true })
  @IsOptional()
  photo_urls?: string[];

  @IsString()
  @IsNotEmpty()
  user_id: string;
}
