import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  // TypeORM NestJS integration
import { ConfigModule } from '@nestjs/config';    // Loads .env files
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),  // Enables reading from .env file
    TypeOrmModule.forRoot({  // Configures database connection
      type: 'postgres',      // Database type
      host: process.env.DB_HOST,     // RDS endpoint from .env
      port: parseInt(process.env.DB_PORT || '5432'),  // Convert string to number
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,  // Automatically finds entity files
      synchronize: process.env.NODE_ENV !== 'production',      // Auto-creates tables (DANGER in production - only for dev)
      ssl: process.env.DB_SSL === 'true' ? {
        ca: './global-bundle.pem'
      } : false
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}