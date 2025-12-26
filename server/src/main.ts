import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin || (isProduction ? false : true),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Tiny Inventory API')
      .setDescription(
        'A small inventory management system that tracks stores and products',
      )
      .setVersion('1.0')
      .addTag('stores', 'Store management endpoints')
      .addTag('products', 'Product management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  if (!isProduction) {
    logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  }
}
void bootstrap();
