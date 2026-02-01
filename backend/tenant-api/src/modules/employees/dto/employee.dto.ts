import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Create Employee DTO
 */
export class CreateEmployeeDto {
    @ApiProperty({ example: 'EMP001' })
    @IsString()
    @IsNotEmpty()
    employee_code: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    full_name: string;

    @ApiProperty({ example: 'john.doe@company.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '+251911234567', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: '1990-01-15', required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    date_of_birth?: Date;

    @ApiProperty({ enum: ['male', 'female', 'other'], required: false })
    @IsEnum(['male', 'female', 'other'])
    @IsOptional()
    gender?: string;

    @ApiProperty({ example: 'uuid-department-id', required: false })
    @IsString()
    @IsOptional()
    department_id?: string;

    @ApiProperty({ example: 'Software Engineer' })
    @IsString()
    @IsNotEmpty()
    position: string;

    @ApiProperty({ example: 'uuid-category-id' })
    @IsString()
    @IsNotEmpty()
    category_id: string;

    @ApiProperty({ example: '2024-01-01' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    hire_date: Date;

    @ApiProperty({ example: 50000.00 })
    @IsNumber()
    @IsNotEmpty()
    basic_salary: number;

    @ApiProperty({ example: '123 Main St, Addis Ababa', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ example: 'Jane Doe', required: false })
    @IsString()
    @IsOptional()
    emergency_contact_name?: string;

    @ApiProperty({ example: '+251922345678', required: false })
    @IsString()
    @IsOptional()
    emergency_contact_phone?: string;

    @ApiProperty({ example: '1234567890', required: false })
    @IsString()
    @IsOptional()
    bank_account_number?: string;

    @ApiProperty({ example: 'Commercial Bank of Ethiopia', required: false })
    @IsString()
    @IsOptional()
    bank_name?: string;

    @ApiProperty({ example: 'TIN-123456', required: false })
    @IsString()
    @IsOptional()
    tax_identification_number?: string;
}

/**
 * Update Employee DTO
 */
export class UpdateEmployeeDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    full_name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    position?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    department_id?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    basic_salary?: number;

    @ApiProperty({ enum: ['active', 'inactive', 'terminated', 'on-leave'], required: false })
    @IsEnum(['active', 'inactive', 'terminated', 'on-leave'])
    @IsOptional()
    employment_status?: string;
}
