import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/custom.decorators';

/**
 * Payroll Controller
 * 
 * Manages payroll processing and payslip generation.
 */
@ApiTags('Payroll')
@Controller('api/v1/payroll')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) { }

    /**
     * Run monthly payroll
     */
    @Post('run')
    @ApiOperation({ summary: 'Run monthly payroll' })
    async runPayroll(
        @TenantId() tenantId: string,
        @Body() dto: { month: number; year: number }
    ) {
        return this.payrollService.runMonthlyPayroll(tenantId, dto.month, dto.year);
    }

    /**
     * Get payroll summary
     */
    @Get('summary/:month/:year')
    @ApiOperation({ summary: 'Get payroll summary' })
    async getPayrollSummary(
        @TenantId() tenantId: string,
        @Param('month') month: number,
        @Param('year') year: number,
    ) {
        return this.payrollService.getPayrollSummary(tenantId, month, year);
    }

    /**
     * Get employee payslip
     */
    @Get('payslip/:payrollId/:userId')
    @ApiOperation({ summary: 'Get employee payslip' })
    async getPayslip(
        @TenantId() tenantId: string,
        @Param('payrollId') payrollId: string,
        @Param('userId') userId: string,
    ) {
        return this.payrollService.getPayslip(tenantId, payrollId, userId);
    }

    /**
     * Download payslip PDF
     */
    @Get('payslip/:payslipId/download')
    @ApiOperation({ summary: 'Download payslip PDF' })
    async downloadPayslip(
        @Param('payslipId') payslipId: string,
    ) {
        return this.payrollService.generatePayslipPDF(payslipId);
    }
}
