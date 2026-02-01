import { IsNotEmpty, IsNumber, IsOptional, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Check-in DTO
 */
export class CheckInDto {
    @ApiProperty({ example: 9.0123456, required: false })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ example: 38.7634567, required: false })
    @IsNumber()
    @IsOptional()
    longitude?: number;

    @ApiProperty({ example: 'Main office entrance', required: false })
    @IsOptional()
    notes?: string;
}

/**
 * Mark Absent DTO
 */
export class MarkAbsentDto {
    @ApiProperty({ example: '2024-01-15' })
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: ['uuid1', 'uuid2'], type: [String] })
    @IsNotEmpty()
    userIds: string[];
}

/**
 * Overtime DTO
 */
export class RecordOvertimeDto {
    @ApiProperty({ example: 'uuid-user-id' })
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ example: '2024-01-15' })
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: 3.5 })
    @IsDecimal()
    @IsNotEmpty()
    hours: number;

    @ApiProperty({ example: 'Client emergency request' })
    @IsOptional()
    reason?: string;
}
