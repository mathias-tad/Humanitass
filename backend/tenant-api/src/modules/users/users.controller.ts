import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/**
 * Users Controller
 * 
 * Manages employee/user operations within a tenant.
 * All operations are tenant-scoped for data isolation.
 * 
 * Security:
 * - JwtAuthGuard: Validates authentication
 * - TenantGuard: Ensures tenant isolation
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard) // Apply to all routes
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Get All Users (Paginated)
     * 
     * Returns list of employees for the authenticated tenant.
     * Supports pagination, filtering, and sorting.
     * 
     * @param req - Request with tenant context
     * @param page - Page number (default: 1)
     * @param limit - Items per page (default: 10)
     * @param search - Search query for name/email
     * @param role - Filter by role
     * @param department - Filter by department
     * @returns Paginated list of users
     */
    @Get()
    @ApiOperation({ summary: 'Get all users for tenant' })
    async findAll(
        @Request() req: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('department') department?: string,
    ) {
        const tenantId = req.user.tenantId;

        return this.usersService.findAll(tenantId, {
            page,
            limit,
            search,
            role,
            department,
        });
    }

    /**
     * Get User by ID
     * 
     * @param req - Request with tenant context
     * @param id - User UUID
     * @returns User details  */
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.usersService.findOne(tenantId, id);
    }

    /**
     * Create New User
     * 
     * Creates a new employee in the tenant's database.
     * Sends account setup email to new user.
     * 
     * @param req - Request with tenant context
     * @param createUserDto - User data
     * @returns Created user
     */
    @Post()
    @ApiOperation({ summary: 'Create new user' })
    async create(
        @Request() req: any,
        @Body() createUserDto: CreateUserDto,
    ) {
        const tenantId = req.user.tenantId;
        return this.usersService.create(tenantId, createUserDto);
    }

    /**
     * Update User
     * 
     * @param req - Request with tenant context
     * @param id - User UUID
     * @param updateUserDto - Updated user data
     * @returns Updated user
     */
    @Put(':id')
    @ApiOperation({ summary: 'Update user' })
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const tenantId = req.user.tenantId;
        return this.usersService.update(tenantId, id, updateUserDto);
    }

    /**
     * Soft Delete User
     * 
     * Sets is_active = false instead of hard delete.
     * Preserves historical data for payroll and attendance.
     * 
     * @param req - Request with tenant context
     * @param id - User UUID
     * @returns Success message
     */
    @Delete(':id')
    @ApiOperation({ summary: 'Deactivate user' })
    async remove(@Request() req: any, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.usersService.softDelete(tenantId, id);
    }

    /**
     * Get User Statistics
     * 
     * Returns aggregated statistics for the tenant.
     * 
     * @param req - Request with tenant context
     * @returns Statistics (total users, by role, by department, etc.)
     */
    @Get('stats/summary')
    @ApiOperation({ summary: 'Get user statistics' })
    async getStats(@Request() req: any) {
        const tenantId = req.user.tenantId;
        return this.usersService.getStatistics(tenantId);
    }
}
