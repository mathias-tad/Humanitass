import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    IsBoolean,
    MinLength,
    MaxLength,
    Matches,
    IsDecimal,
    IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for Creating Users
 * 
 * Implements comprehensive validation using class-validator decorators.
 * Used for API request validation and Swagger documentation.
 */
export class CreateUserDto {
    @ApiProperty({ example: 'john.doe@company.com', description: 'User email address' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({ example: 'John Doe', description: 'Full name of the employee' })
    @IsString()
    @IsNotEmpty({ message: 'Full name is required' })
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
    full_name: string;

    @ApiPropertyOptional({ example: '+251912345678', description: 'Phone number' })
    @IsString()
    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Please provide a valid phone number',
    })
    phone?: string;

    @ApiProperty({ example: 'employee', enum: ['admin', 'manager', 'employee'] })
    @IsEnum(['admin', 'manager', 'employee'], {
        message: 'Role must be one of: admin, manager, employee',
    })
    role: string;

    @ApiPropertyOptional({ example: 'Engineering', description: 'Department name' })
    @IsString()
    @IsOptional()
    department?: string;

    @ApiPropertyOptional({ example: 'Senior Developer', description: 'Job position' })
    @IsString()
    @IsOptional()
    position?: string;

    @ApiProperty({ example: '50000.00', description: 'Basic monthly salary' })
    @IsDecimal({ decimal_digits: '2' }, { message: 'Salary must be a valid decimal number' })
    @IsNotEmpty({ message: 'Basic salary is required' })
    basic_salary: number;

    @ApiPropertyOptional({ description: 'Employee category UUID' })
    @IsUUID('4', { message: 'Invalid category ID format' })
    @IsOptional()
    employee_category_id?: string;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

/**
 * Data Transfer Object for Updating Users
 * 
 * All fields are optional for partial updates.
 * Extends Partial<CreateUserDto> pattern.
 */
export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Jane Smith' })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(255)
    full_name?: string;

    @ApiPropertyOptional({ example: '+251923456789' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 'manager' })
    @IsEnum(['admin', 'manager', 'employee'])
    @IsOptional()
    role?: string;

    @ApiPropertyOptional({ example: 'Sales' })
    @IsString()
    @IsOptional()
    department?: string;

    @ApiPropertyOptional({ example: 'Team Lead' })
    @IsString()
    @IsOptional()
    position?: string;

    @ApiPropertyOptional({ example: '65000.00' })
    @IsDecimal({ decimal_digits: '2' })
    @IsOptional()
    basic_salary?: number;

    @ApiPropertyOptional()
    @IsUUID('4')
    @IsOptional()
    employee_category_id?: string;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

/**
 * Data Transfer Object for User Query/Filtering
 * 
 * Used for GET requests with query parameters.
 * Supports pagination, search, and filtering.
 */
export class UserQueryDto {
    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Items per page' })
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ example: 'john', description: 'Search by name or email' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ example: 'employee', description: 'Filter by role' })
    @IsString()
    @IsOptional()
    role?: string;

    @ApiPropertyOptional({ example: 'Engineering', description: 'Filter by department' })
    @IsString()
    @IsOptional()
    department?: string;

    @ApiPropertyOptional({ example: 'true', description: 'Filter by active status' })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiPropertyOptional({
        example: 'created_at',
        enum: ['created_at', 'full_name', 'email'],
        description: 'Sort by field'
    })
    @IsString()
    @IsOptional()
    sortBy?: string = 'created_at';

    @ApiPropertyOptional({
        example: 'DESC',
        enum: ['ASC', 'DESC'],
        description: 'Sort order'
    })
    @IsString()
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * Response DTO for User List
 * 
 * Standardized pagination response format.
 */
export class UserListResponseDto {
    @ApiProperty()
    data: any[]; // Array of User entities

    @ApiProperty({ example: 100 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 10 })
    totalPages: number;
}
