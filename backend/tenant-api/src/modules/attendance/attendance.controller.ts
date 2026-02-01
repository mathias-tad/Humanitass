import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId, UserId, Pagination } from '../../common/decorators/custom.decorators';

/**
 * Attendance Controller
 * 
 * Manages employee attendance tracking, check-in/out, and reports.
 */
@ApiTags('Attendance')
@Controller('api/v1/attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    /**
     * Check-in employee
     */
    @Post('check-in')
    @ApiOperation({ summary: 'Employee check-in' })
    async checkIn(
        @TenantId() tenantId: string,
        @UserId() userId: string,
        @Body() dto: { latitude?: number; longitude?: number }
    ) {
        return this.attendanceService.checkIn(tenantId, userId, dto);
    }

    /**
     * Check-out employee
     */
    @Post('check-out')
    @ApiOperation({ summary: 'Employee check-out' })
    async checkOut(
        @TenantId() tenantId: string,
        @UserId() userId: string,
    ) {
        return this.attendanceService.checkOut(tenantId, userId);
    }

    /**
     * Get attendance records
     */
    @Get()
    @ApiOperation({ summary: 'Get attendance records' })
    async getAttendance(
        @TenantId() tenantId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Pagination() pagination: any,
    ) {
        return this.attendanceService.getAttendance(
            tenantId,
            startDate,
            endDate,
            pagination
        );
    }

    /**
     * Get attendance summary for employee
     */
    @Get('summary/:userId')
    @ApiOperation({ summary: 'Get attendance summary' })
    async getSummary(
        @TenantId() tenantId: string,
        @Param('userId') userId: string,
        @Query('month') month: number,
        @Query('year') year: number,
    ) {
        return this.attendanceService.getSummary(tenantId, userId, month, year);
    }

    /**
     * Mark absent employees (admin only)
     */
    @Post('mark-absent')
    @ApiOperation({ summary: 'Mark absent employees' })
    async markAbsent(
        @TenantId() tenantId: string,
        @Body() dto: { date: string; userIds: string[] }
    ) {
        return this.attendanceService.markAbsent(tenantId, dto.date, dto.userIds);
    }
}
