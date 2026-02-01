import { IsNotEmpty, IsString, IsNumber, IsDate, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Submit Leave Request DTO
 */
export class SubmitLeaveDto {
    @ApiProperty({ example: 'uuid-leave-type-id' })
    @IsString()
    @IsNotEmpty()
    leave_type_id: string;

    @ApiProperty({ example: '2024-02-01' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    start_date: Date;

    @ApiProperty({ example: '2024-02-05' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    end_date: Date;

    @ApiProperty({ example: 'Family vacation' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}

/**
 * Approve/Reject Leave DTO
 */
export class ReviewLeaveDto {
    @ApiProperty({ enum: ['approved', 'rejected'] })
    @IsEnum(['approved', 'rejected'])
    @IsNotEmpty()
    status: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    rejection_reason?: string;
}
