import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

/**
 * Bootstrap the Tenant API application
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // CORS
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:1300'],
        credentials: true,
    });

    // Cookie parser
    app.use(cookieParser());

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Swagger API documentation
    const config = new DocumentBuilder()
        .setTitle('Humanitas Tenant API')
        .setDescription('Multi-tenant ERP API for HR, Payroll, and Attendance')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentication')
        .addTag('Users')
        .addTag('Employees')
        .addTag('Attendance')
        .addTag('Payroll')
        .addTag('Leaves')
        .addTag('Performance')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Start server
    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`🚀 Tenant API running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
