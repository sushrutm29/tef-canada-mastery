import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';    // Loads .env files
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma.service.js';
import { ExpressionsController } from './expressions/expressions.controller.js';
import { ExpressionsService } from './expressions/expressions.service.js';

@Module({
  imports: [
    ConfigModule.forRoot()  // Enables reading from .env file
  ],
  controllers: [AppController, ExpressionsController],
  providers: [AppService, PrismaService, ExpressionsService],
})
export class AppModule {}