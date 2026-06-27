import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV === 'development' }),
  );

  // Register cookie plugin for refresh token httpOnly cookies
  await app.register(fastifyCookie, {
    secret: process.env.AUTH_SECRET ?? 'cookie-secret-change-in-prod',
  });

  // Enable raw body for Stripe webhook signature verification
  app.getHttpAdapter().getInstance().addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    function (_req: unknown, body: Buffer, done: (err: null, body: Buffer) => void) {
      done(null, body);
    },
  );

  app.enableCors({
    origin: process.env.APP_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EnSocial API')
      .setDescription('EnSocial — AI-powered social media OS. All endpoints versioned under /api/v1/')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger docs: http://localhost:3000/api/docs');
  }

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`EnSocial API running on http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
