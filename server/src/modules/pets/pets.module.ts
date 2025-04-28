import { Module } from '@nestjs/common';
import { FirebaseAuthModule } from 'src/auth/firebase-auth.module';
import { DatabaseModule } from 'src/helpers/database.module';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetsRepository } from './prisma-pets-repository';

@Module({
  imports: [DatabaseModule, FirebaseAuthModule],
  controllers: [PetsController],
  providers: [PetsService, PetsRepository],
})
export class PetsModule {}
