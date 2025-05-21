import { Injectable } from '@nestjs/common';
import { Species } from '@prisma/client';
import * as dayjs from 'dayjs';
import { UpdateRequest } from 'firebase-admin/auth';
import * as QRCode from 'qrcode';
import { FirebaseAuthService } from 'src/auth/firebase-auth.service';
import { RegisterUserDto, RegisterUserOutputDto } from './dto/create-user-dto';
import { PetDetailDto } from './dto/get-pet-datail.dto';
import { PetResponseDto } from './dto/get-pets-from-user';
import { UserProfileResponseDto } from './dto/get-user-profile.dto';
import { RegisterPetWithCodeDto, RequestPetCodeDto } from './dto/pet-code.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PetWithUser } from './pets.controller';
import { PetsError } from './pets.errors';
import { PetsRepository } from './prisma-pets-repository';

@Injectable()
export class PetsService {
  constructor(
    private readonly petsRepository: PetsRepository,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async registerUser(input: RegisterUserDto): Promise<RegisterUserOutputDto> {
    const { users } = input;

    if (!users.some((user) => user.external_id)) {
      throw new PetsError('PET-602');
    }

    users.forEach((user) => {
      if (user.addresses && user.addresses.length > 0) {
        const primary_addresses = user.addresses.filter(
          (addr) => addr.is_primary,
        );
        if (primary_addresses.length === 0) {
          user.addresses[0].is_primary = true;
        }
      }
    });

    const result = await this.petsRepository.createUserTransaction({
      users,
    });

    return {
      user_ids: result.user_ids.map((id) => id),
      created_at: result.created_at,
    };
  }

  async getPetByQrCode(qr_code: string): Promise<PetWithUser> {
    if (!qr_code) {
      throw new PetsError('PET-800');
    }
    const pet = await this.petsRepository.findPetByQr(qr_code);
    if (!pet) {
      throw new PetsError('PET-801');
    }

    return pet;
  }

  async getUserProfile(external_id: string): Promise<UserProfileResponseDto> {
    const user = await this.petsRepository.getUserWithAddresses(external_id);
    if (!user) throw new PetsError('PET-802');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      addresses: user.addresses?.map((address) => ({
        id: address.id,
        street: address.street,
        number: address.number,
        apartment: address.apartment,
        neighborhood: address.neighborhood,
        zip_code: address.zip_code,
        is_primary: address.is_primary,
        province: address.province.name,
        province_id: address.province_id,
        locality: address.locality.name,
        locality_id: address.locality_id,
      })),
    };
  }

  async getUserPets(external_id: string): Promise<PetResponseDto[]> {
    const pets = await this.petsRepository.getUserPets(external_id);
    if (!pets || pets.length === 0) return [];

    return pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? undefined,
      color: pet.color,
      distinctive_marks: pet.distinctive_marks ?? undefined,
      birthdate: pet.birthdate ?? undefined,
      pet_code_id: pet.pet_code_id,
      photos: pet.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        is_primary: photo.is_primary,
      })),
    }));
  }

  private async validateAddress(
    external_id: string,
    data: RequestPetCodeDto,
  ): Promise<string> {
    const user = await this.petsRepository.findUserByExternalId(external_id);
    if (!user) throw new PetsError('PET-802');
    if (data.address_id) return data.address_id;

    if (
      !data.street ||
      !data.number ||
      !data.province_id ||
      !data.locality_id
    ) {
      throw new PetsError('PET-805');
    }

    const newAddress = await this.petsRepository.createAddress({
      user_id: user.id,
      street: data.street,
      number: data.number,
      apartment: data.apartment,
      neighborhood: data.neighborhood,
      zip_code: data.zip_code,
      province_id: data.province_id,
      locality_id: data.locality_id,
      is_primary: false,
      show_address: false,
    });

    return newAddress.id;
  }

  async requestPetCode(
    user_id: string,
    data: RequestPetCodeDto,
  ): Promise<{ code: string; qrImage: string; registrationUrl: string }> {
    // 1. Verificar si el usuario tiene dirección primaria o usar la proporcionada
    // TODO: HACER ESTA IMPLEMENTACIÓN CUANDO GENEREMOS LO DEL ENVIO DE LAS CHAPITAS
    const address_id = await this.validateAddress(user_id, data);
    console.log(address_id);

    // 2. Generar código único para la chapa
    const petCode = await this.petsRepository.createPetCode();

    // 3. Configuración URL del frontend
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3001';
    const registrationUrl = `${frontendUrl}/register-pet/${petCode.id}`;

    const qrOptions: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    let qrImage: string;
    try {
      qrImage = await QRCode.toDataURL(registrationUrl, qrOptions);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new PetsError('PET-806'); // Error generando QR code
    }

    // ESTA FUNCIONALIDAD LA DEJAMOS PARA LUEGO.
    // 4. Registrar la solicitud de chapa (podrías guardar esto en otra tabla)
    // await this.petsRepository.createCodeDeliveryRequest({
    //   codeId: petCode.id,
    //   address_id,
    //   user_id,
    // });

    return {
      code: petCode.id,
      qrImage,
      registrationUrl,
    };
  }

  async checkCodeStatus(code: string): Promise<{ is_activated: boolean }> {
    const petCode = await this.petsRepository.findPetCode(code);
    if (!petCode) {
      throw new PetsError('PET-803');
    }

    return {
      is_activated: !!petCode.activated_date,
    };
  }

  async registerPetWithCode(
    data: RegisterPetWithCodeDto,
  ): Promise<PetResponseDto> {
    // 1. Verificar que el código exista y no esté activado
    const petCode = await this.petsRepository.findPetCode(data.code);
    if (!petCode) {
      throw new PetsError('PET-803');
    }
    if (petCode.activated_date) {
      throw new PetsError('PET-804');
    }

    // 2. Crear la mascota
    const pet = await this.petsRepository.createPet({
      name: data.name,
      species: data.species as Species,
      breed: data.breed,
      color: data.color,
      distinctive_marks: data.distinctive_marks,
      birthdate: data.birthdate ? dayjs(data.birthdate).toDate() : null,
      pet_code_id: data.code,
    });

    // 3. Asociar mascota al usuario
    await this.petsRepository.associatePetToUser(pet.id, data.user_id);

    // 4. Marcar código como activado
    await this.petsRepository.activatePetCode(data.code);

    // 5. Guardar fotos si existen
    if (data.photo_urls && data.photo_urls.length > 0) {
      await Promise.all(
        data.photo_urls.map((url, index) =>
          this.petsRepository.createPetPhoto({
            pet_id: pet.id,
            url,
            is_primary: index === 0,
          }),
        ),
      );
    }

    // 6. Obtener mascota con fotos para la respuesta
    const petWithPhotos = await this.petsRepository.getPetWithPhotos(pet.id);

    return {
      id: petWithPhotos.id,
      name: petWithPhotos.name,
      species: petWithPhotos.species,
      breed: petWithPhotos.breed ?? undefined,
      color: petWithPhotos.color,
      distinctive_marks: petWithPhotos.distinctive_marks ?? undefined,
      birthdate: petWithPhotos.birthdate ?? undefined,
      pet_code_id: petWithPhotos.pet_code_id,
      photos: petWithPhotos.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        is_primary: photo.is_primary,
      })),
    };
  }

  async getPetDetail(pet_id: string, user_id: string): Promise<PetDetailDto> {
    const pet = await this.petsRepository.getPetDetail(pet_id, user_id);
    if (!pet) throw new PetsError('PET-807');

    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? undefined,
      color: pet.color,
      distinctive_marks: pet.distinctive_marks ?? undefined,
      birthdate: pet.birthdate ?? undefined,
      pet_code_id: pet.pet_code_id,
      photos: pet.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        is_primary: photo.is_primary,
      })),
      users: pet.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses:
          user.addresses?.map((address) => ({
            id: address.id,
            street: address.street,
            number: address.number,
            apartment: address.apartment,
            neighborhood: address.neighborhood,
            zip_code: address.zip_code,
            is_primary: address.is_primary,
            province: address.province.name,
            locality: address.locality.name,
          })) ?? [],
      })),
    };
  }

  async getPublicPetDetail(pet_id: string): Promise<PetDetailDto> {
    const pet = await this.petsRepository.getPublicPetDetail(pet_id);
    if (!pet) throw new PetsError('PET-807');

    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? undefined,
      color: pet.color,
      distinctive_marks: pet.distinctive_marks ?? undefined,
      birthdate: pet.birthdate ?? undefined,
      pet_code_id: pet.pet_code_id,
      photos: pet.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        is_primary: photo.is_primary,
      })),
      users: pet.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses:
          user.addresses?.map((address) => ({
            id: address.id,
            street: address.street,
            number: address.number,
            apartment: address.apartment,
            neighborhood: address.neighborhood,
            zip_code: address.zip_code,
            is_primary: address.is_primary,
            province: address.province.name,
            locality: address.locality.name,
          })) ?? [],
      })),
    };
  }

  private async validateEmailUniqueness(
    user_id: string,
    email: string,
  ): Promise<void> {
    const existingUser = await this.petsRepository.findByEmail(email);
    if (existingUser && existingUser.id !== user_id) {
      throw new PetsError('PET-603');
    }
  }

  private async validatePhoneUniqueness(
    user_id: string,
    phone: string,
  ): Promise<void> {
    const existingUser = await this.petsRepository.findByPhone(phone);
    if (existingUser && existingUser.id !== user_id) {
      throw new PetsError('PET-604');
    }
  }

  async updateUser(
    user_id: string,
    data: UpdateUserDto,
  ): Promise<{ updated_fields: Partial<UpdateUserDto> }> {
    const updated_fields: Partial<UpdateUserDto> = {};

    if (data.email) {
      await this.validateEmailUniqueness(user_id, data.email);
      updated_fields.email = data.email;
    }

    if (data.phone) {
      await this.validatePhoneUniqueness(user_id, data.phone);
      updated_fields.phone = data.phone;
    }

    if (data.name) {
      updated_fields.name = data.name;
    }

    const firebaseUpdateData: UpdateRequest = {};

    if (data.name) firebaseUpdateData.displayName = data.name;
    if (data.email) {
      firebaseUpdateData.email = data.email;
      firebaseUpdateData.emailVerified = false;
    }
    if (data.phone) {
      firebaseUpdateData.phoneNumber =
        this.firebaseAuthService.formatPhoneNumber(data.phone);
    }

    try {
      await this.firebaseAuthService.updateUser(user_id, firebaseUpdateData);

      await this.petsRepository.updateUser(user_id, data);

      return { updated_fields };
    } catch (error) {
      console.error('Error en updateUser:', error);
      throw new PetsError('PET-702');
    }
  }
}
