import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/helpers/database.module';
import { ProvincesRepository } from './prisma-provinces-repository';
import { ProvincesController } from './provinces.controller';
import { ProvincesService } from './provinces.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProvincesController],
  providers: [ProvincesService, ProvincesRepository],
})
export class ProvincesModule {}
