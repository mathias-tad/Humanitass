import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../common/decorators/custom.decorators';

/**
 * Leaves Controller
 * 
 * Manages leave requests and approvals.
 */
@ApiTags('Leaves')
@Controller('api/v1/leaves')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeavesController {
    constructor(private readonly leavesService: LeavesService) { }

    @Post()
    @ApiOperation({ summary: 'Submit leave request' })
    async submitLeave(
        @TenantId() tenantId: string,
        @UserId() userId: string,
        @Body() dto: any,
    ) {
        return this.leavesService.submitLeave(tenantId, userId, dto);
    }

    @Get('my-requests')
    @ApiOperation({ summary: 'Get my leave requests' })
    async getMyRequests(
        @TenantId() tenantId: string,
        @UserId() userId: string,
    ) {
        return this.leavesService.getUserLeaves(tenantId, userId);
    }

    @Get('pending')
    @ApiOperation({ summary: 'Get pending leave requests (manager)' })
    async getPendingRequests(
        @TenantId() tenantId: string,
    ) {
        return this.leavesService.getPendingLeaves(tenantId);
    }

    @Put(':id/approve')
    @ApiOperation({ summary: 'Approve leave request' })
    async approve(
        @TenantId() tenantId: string,
        @UserId() userId: string,
        @Param('id') id: string,
    ) {
        return this.leavesService.approveLeave(tenantId, id, userId);
    }

    @Put(':id/reject')
    @ApiOperation({ summary: 'Reject leave request' })
    async reject(
        @TenantId() tenantId: string,
        @UserId() userId: string,
        @Param('id') id: string,
        @Body() dto: { reason: string },
    ) {
        return this.leavesService.rejectLeave(tenantId, id, userId, dto.reason);
    }

    @Get('balance/:userId')
    @ApiOperation({ summary: 'Get leave balance' })
    async getBalance(
        @TenantId() tenantId: string,
        @Param('userId') userId: string,
    ) {
        return this.leavesService.getLeaveBalance(tenantId, userId);
    }
}
