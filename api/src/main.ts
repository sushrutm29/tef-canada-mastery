import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://tefcanadaexpert.com',
      'https://www.tefcanadaexpert.com',
      'http://localhost:3000',
    ],
  });
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();
