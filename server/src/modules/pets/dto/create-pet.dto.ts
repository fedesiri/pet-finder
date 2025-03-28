import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;
}

export class CreatePetDto {
  @IsString()
  name: string;

  @IsString()
  species: string;

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
