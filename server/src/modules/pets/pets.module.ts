import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/helpers/database.module';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetsRepository } from './prisma-pets-repository';

@Module({
  imports: [DatabaseModule],
  controllers: [PetsController],
  providers: [PetsService, PetsRepository],
})
export class PetsModule {}
