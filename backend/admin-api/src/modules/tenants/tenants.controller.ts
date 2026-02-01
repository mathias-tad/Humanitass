import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Tenants Controller (Admin API)
 * 
 * Manages tenant organizations in the multi-tenant system.
 * This controller is part of the Admin API and handles:
 * - Tenant registration and provisioning
 * - Database creation for new tenants
 * - Subscription management
 * - Tenant configuration
 * 
 * Only accessible by system administrators.
 */
@ApiTags('Tenants')
@Controller('api/v1/tenants')
@UseGuards(JwtAuthGuard) // Admin authentication required
@ApiBearerAuth()
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    /**
     * Create new tenant organization
     * 
     * This endpoint provisions a complete tenant environment:
     * 1. Creates tenant record in master database
     * 2. Creates dedicated PostgreSQL database
     * 3. Initializes database schema
     * 4. Seeds default data (roles, settings)
     * 5. Sends welcome email
     * 
     * @param createTenantDto - Tenant information
     * @returns Created tenant with credentials
     */
    @Post()
    @ApiOperation({ summary: 'Create new tenant and provision database' })
    async create(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantsService.createTenant(createTenantDto);
    }

    /**
     * Get all tenants
     * 
     * Returns a list of all tenant organizations with:
     * - Basic info (name, slug, status)
     * - Subscription details
     * - User count
     * - Database name
     * 
     * @returns Array of tenants
     */
    @Get()
    @ApiOperation({ summary: 'Get all tenants' })
    async findAll() {
        return this.tenantsService.findAll();
    }

    /**
     * Get tenant by ID
     * 
     * @param id - Tenant UUID
     * @returns Tenant details with statistics
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get tenant by ID' })
    async findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    /**
     * Get tenant statistics
     * 
     * Returns aggregated metrics:
     * - Total users
     * - Active employees
     * - Monthly payroll runs
     * - Storage usage
     * - API call count
     * 
     * @param id - Tenant UUID
     * @returns Tenant statistics
     */
    @Get(':id/statistics')
    @ApiOperation({ summary: 'Get tenant statistics' })
    async getStatistics(@Param('id') id: string) {
        return this.tenantsService.getStatistics(id);
    }

    /**
     * Suspend tenant
     * 
     * Suspends tenant access due to:
     * - Non-payment
     * - Terms violation
     * - Security concerns
     * 
     * @param id - Tenant UUID
     * @returns Success message
     */
    @Post(':id/suspend')
    @ApiOperation({ summary: 'Suspend tenant access' })
    async suspend(@Param('id') id: string) {
        return this.tenantsService.suspendTenant(id);
    }

    /**
     * Reactivate suspended tenant
     * 
     * @param id - Tenant UUID
     * @returns Success message
     */
    @Post(':id/reactivate')
    @ApiOperation({ summary: 'Reactivate tenant' })
    async reactivate(@Param('id') id: string) {
        return this.tenantsService.reactivateTenant(id);
    }

    /**
     * Delete tenant (dangerous operation)
     * 
     * Permanently deletes:
     * - Tenant record
     * - Dedicated database
     * - All user data
     * - File uploads
     * 
     * This is irreversible!
     * 
     * @param id - Tenant UUID
     * @returns Success message
     */
    @Post(':id/delete-permanently')
    @ApiOperation({
        summary: 'Permanently delete tenant',
        description: '⚠️ DANGER: This action is irreversible!'
    })
    async deletePermanently(@Param('id') id: string) {
        return this.tenantsService.deleteTenantPermanently(id);
    }
}
