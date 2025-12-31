import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS (allows frontend to connect)
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development
      'https://multi-tenant-project-management-system.vercel.app' // Production frontend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Enable validation for all endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unknown properties
      transform: true, // Auto-transform types
    }),
  );
  
  // API prefix (all routes will start with /api)
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}
bootstrap();
