import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

export class RegisterUserDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  users: CreateUserDto[];
}

export class RegisterUserOutputDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  user_ids: string[];

  @IsDateString()
  created_at: Date;
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
