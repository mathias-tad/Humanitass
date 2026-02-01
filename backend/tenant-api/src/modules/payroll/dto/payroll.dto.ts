import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Run Payroll DTO
 */
export class RunPayrollDto {
    @ApiProperty({ example: 1, description: 'Month (1-12)' })
    @IsNumber()
    @IsNotEmpty()
    month: number;

    @ApiProperty({ example: 2024 })
    @IsNumber()
    @IsNotEmpty()
    year: number;
}

/**
 * Approve Payroll DTO
 */
export class ApprovePayrollDto {
    @ApiProperty({ example: 'uuid-payroll-id' })
    @IsNotEmpty()
    payroll_id: string;
}
