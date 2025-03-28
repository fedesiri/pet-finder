import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './helpers/database.module';
import { PetsModule } from './modules/pets/pets.module';

@Module({
  imports: [DatabaseModule, PetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
