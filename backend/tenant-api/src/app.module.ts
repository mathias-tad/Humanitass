import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { LeavesModule } from './modules/leaves/leaves.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { DatabaseModule } from './modules/database/database.module';

/**
 * App Module
 * 
 * Root module that imports all feature modules.
 */
@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Database
        TypeOrmModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: getDatabaseConfig,
        }),

        // Scheduling (for cron jobs)
        ScheduleModule.forRoot(),

        // Feature Modules
        AuthModule,
        UsersModule,
        EmployeesModule,
        AttendanceModule,
        PayrollModule,
        LeavesModule,
        PerformanceModule,
        DatabaseModule,
    ],
})
export class AppModule { }
