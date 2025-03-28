import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const databaseUri = process.env.DATABASE_URL;

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: databaseUri,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
