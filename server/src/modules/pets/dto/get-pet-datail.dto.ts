export interface PetUserAddressDto {
  id: string;
  street: string;
  number: string;
  apartment?: string;
  neighborhood?: string;
  zip_code?: string;
  is_primary: boolean;
  province: string;
  locality: string;
}

export interface PetUsersDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: PetUserAddressDto[];
}

export interface PetPhotoDto {
  id: string;
  url: string;
  is_primary: boolean;
}

export interface PetDetailDto {
  id: string;
  name: string;
  species: string;
  breed?: string;
  color: string;
  distinctive_marks?: string;
  birthdate?: Date;
  pet_code_id?: string;
  photos: PetPhotoDto[];
  users: PetUsersDto[];
}

export interface ProvinceRepositoryDto {
  name: string;
}

export interface LocalityRepositoryDto {
  name: string;
}

export interface UserAddressRepositoryDto {
  id: string;
  street: string;
  number: string;
  apartment: string | null;
  neighborhood: string | null;
  zip_code: string | null;
  is_primary: boolean;
  province: ProvinceRepositoryDto;
  locality: LocalityRepositoryDto;
  province_id: string;
  locality_id: string;
}

export interface PetPhotoRepositoryDto {
  id: string;
  url: string;
  is_primary: boolean;
}

export interface PetUserRepositoryDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  addresses: UserAddressRepositoryDto[];
}

export interface PetWithPhotosAndUsersRepositoryDto {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  color: string;
  distinctive_marks: string | null;
  birthdate: Date | null;
  pet_code_id: string | null;
  photos: PetPhotoRepositoryDto[];
  users: PetUserRepositoryDto[];
}
