import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  // TypeORM NestJS integration
import { ConfigModule } from '@nestjs/config';    // Loads .env files
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot(),  // Enables reading from .env file
    TypeOrmModule.forRoot({  // Configures database connection
      type: 'postgres',      // Database type
      host: process.env.DB_HOST,     // RDS endpoint from .env
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,  // Automatically finds entity files and updates db accordingly
      synchronize: process.env.NODE_ENV !== 'production',      // Auto-creates tables (DANGER in production - only for dev)
      ssl: process.env.DB_SSL === 'true' ? {
        ca: fs.readFileSync('./global-bundle.pem').toString()
      } : false
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}