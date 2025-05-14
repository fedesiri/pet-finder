import { Module } from '@nestjs/common';
import { FirebaseAuthModule } from 'src/auth/firebase-auth.module';
import { DatabaseModule } from 'src/helpers/database.module';
import { LostPetsController } from './lost-pets.controller';
import { LostPetsService } from './lost-pets.service';
import { LostPetsRepository } from './prisma-lost-pets-repository';

@Module({
  imports: [DatabaseModule, FirebaseAuthModule],
  controllers: [LostPetsController],
  providers: [LostPetsService, LostPetsRepository],
})
export class LostPetsModule {}
