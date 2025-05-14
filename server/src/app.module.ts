import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './helpers/database.module';
import { LostPetsModule } from './modules/lost-pets/lost-pets.module';
import { PetsModule } from './modules/pets/pets.module';
import { ProvincesModule } from './modules/provinces/provinces.module';

@Module({
  imports: [DatabaseModule, PetsModule, ProvincesModule, LostPetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
