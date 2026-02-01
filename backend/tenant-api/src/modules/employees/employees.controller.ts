import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId, Pagination } from '../../common/decorators/custom.decorators';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

/**
 * Employees Controller
 * 
 * Manages employee records and organizational structure.
 */
@ApiTags('Employees')
@Controller('api/v1/employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all employees' })
    async findAll(
        @TenantId() tenantId: string,
        @Pagination() pagination: any,
        @Query('search') search?: string,
        @Query('department') department?: string,
        @Query('status') status?: string,
    ) {
        return this.employeesService.findAll(tenantId, {
            ...pagination,
            search,
            department,
            status,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get employee by ID' })
    async findOne(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.employeesService.findOne(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new employee' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateEmployeeDto,
    ) {
        return this.employeesService.create(tenantId, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update employee' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateEmployeeDto,
    ) {
        return this.employeesService.update(tenantId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete employee' })
    async remove(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.employeesService.remove(tenantId, id);
    }

    @Get(':id/payroll-history')
    @ApiOperation({ summary: 'Get employee payroll history' })
    async getPayrollHistory(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.employeesService.getPayrollHistory(tenantId, id);
    }

    @Get(':id/attendance-summary')
    @ApiOperation({ summary: 'Get employee attendance summary' })
    async getAttendanceSummary(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Query('month') month: number,
        @Query('year') year: number,
    ) {
        return this.employeesService.getAttendanceSummary(tenantId, id, month, year);
    }
}
