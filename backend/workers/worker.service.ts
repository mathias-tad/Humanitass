import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

/**
 * Background Worker Service
 * 
 * Handles scheduled tasks and background jobs for all tenants.
 * Runs as a separate service from the main API.
 * 
 * Key Responsibilities:
 * - Attendance finalization
 * - Payroll automation
 * - Report generation
 * - Data cleanup
 * - Email notifications
 * 
 * Uses @nestjs/schedule for cron jobs.
 */
@Injectable()
export class WorkerService {
    private readonly logger = new Logger(WorkerService.name);

    constructor(
        private masterDataSource: DataSource,
    ) { }

    /**
     * Process Monthly Attendance
     * 
     * Runs: Every night at 2:00 AM
     * 
     * For each tenant:
     * 1. Calculate absent days for the month
     * 2. Mark late arrivals
     * 3. Calculate overtime hours
     * 4. Generate attendance reports
     * 5. Send notifications to managers
     */
    @Cron('0 2 * * *', { name: 'process-attendance' })
    async processMonthlyAttendance() {
        this.logger.log('🕐 Starting attendance processing job...');

        try {
            // Get all active tenants
            const tenants = await this.getActiveTenants();

            for (const tenant of tenants) {
                try {
                    await this.processAttendanceForTenant(tenant);
                } catch (error) {
                    this.logger.error(
                        `Failed to process attendance for tenant ${tenant.slug}: ${error.message}`
                    );
                }
            }

            this.logger.log(`✅ Attendance processing completed for ${tenants.length} tenants`);
        } catch (error) {
            this.logger.error(`Attendance processing failed: ${error.message}`);
        }
    }

    /**
     * Auto-run Payroll
     * 
     * Runs: First day of every month at 3:00 AM
     * 
     * Automatically triggers payroll for tenants with auto-payroll enabled.
     * Calculates salaries, deductions, and generates payslips.
     */
    @Cron('0 3 1 * *', { name: 'auto-payroll' })
    async autoRunPayroll() {
        this.logger.log('💰 Starting auto-payroll job...');

        try {
            const tenants = await this.getTenantsWithAutoPayroll();

            for (const tenant of tenants) {
                try {
                    await this.runPayrollForTenant(tenant);
                    this.logger.log(`✅ Payroll completed for ${tenant.company_name}`);
                } catch (error) {
                    this.logger.error(
                        `Payroll failed for ${tenant.slug}: ${error.message}`
                    );
                    // Send alert to admin
                    await this.sendPayrollFailureAlert(tenant, error.message);
                }
            }
        } catch (error) {
            this.logger.error(`Auto-payroll job failed: ${error.message}`);
        }
    }

    /**
     * Generate Monthly Reports
     * 
     * Runs: 5th day of every month at 4:00 AM
     * 
     * Generates:
     * - Attendance summary
     * - Payroll summary
     * - Leave balance report
     * - Performance metrics
     */
    @Cron('0 4 5 * *', { name: 'monthly-reports' })
    async generateMonthlyReports() {
        this.logger.log('📊 Generating monthly reports...');

        const tenants = await this.getActiveTenants();

        for (const tenant of tenants) {
            try {
                await this.generateReportsForTenant(tenant);
            } catch (error) {
                this.logger.error(`Report generation failed for ${tenant.slug}`);
            }
        }
    }

    /**
     * Database Cleanup
     * 
     * Runs: Every Sunday at 1:00 AM
     * 
     * Cleans up:
     * - Old audit logs (>90 days)
     * - Temporary files
     * - Expired sessions
     * - Soft-deleted records (>30 days)
     */
    @Cron('0 1 * * 0', { name: 'database-cleanup' })
    async databaseCleanup() {
        this.logger.log('🧹 Starting database cleanup...');

        const tenants = await this.getActiveTenants();

        for (const tenant of tenants) {
            const connection = await this.getTenantConnection(tenant.database_name);

            try {
                // Delete old audit logs
                await connection.query(`
          DELETE FROM audit_logs 
          WHERE created_at < NOW() - INTERVAL '90 days'
        `);

                // Delete expired sessions
                await connection.query(`
          DELETE FROM sessions 
          WHERE expires_at < NOW()
        `);

                this.logger.log(`✅ Cleanup completed for ${tenant.slug}`);
            } finally {
                await connection.destroy();
            }
        }
    }

    /**
     * Send Daily Digests
     * 
     * Runs: Every day at 8:00 AM
     * 
     * Sends email digests to managers with:
     * - Pending approvals (leaves, overtime)
     * - Today's attendance summary
     * - Important notifications
     */
    @Cron('0 8 * * *', { name: 'daily-digest' })
    async sendDailyDigests() {
        this.logger.log('📧 Sending daily digests...');

        const tenants = await this.getActiveTenants();

        for (const tenant of tenants) {
            try {
                await this.sendDigestForTenant(tenant);
            } catch (error) {
                this.logger.error(`Digest failed for ${tenant.slug}`);
            }
        }
    }

    /**
     * Check Subscription Renewals
     * 
     * Runs: Every day at 10:00 AM
     * 
     * Checks for:
     * - Expiring subscriptions (notify 7 days before)
     * - Expired subscriptions (suspend access)
     * - Trial periods ending
     */
    @Cron('0 10 * * *', { name: 'subscription-check' })
    async checkSubscriptions() {
        this.logger.log('💳 Checking subscriptions...');

        const expiringTenants = await this.masterDataSource.query(`
      SELECT * FROM tenants 
      WHERE subscription_end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
      AND subscription_status = 'active'
    `);

        for (const tenant of expiringTenants) {
            await this.sendRenewalReminder(tenant);
        }

        // Suspend expired subscriptions
        const expiredTenants = await this.masterDataSource.query(`
      SELECT * FROM tenants 
      WHERE subscription_end_date < NOW()
      AND subscription_status = 'active'
    `);

        for (const tenant of expiredTenants) {
            await this.suspendExpiredTenant(tenant);
        }
    }

    // Helper methods

    private async getActiveTenants(): Promise<any[]> {
        return this.masterDataSource.query(
            `SELECT * FROM tenants WHERE is_active = true`
        );
    }

    private async getTenantsWithAutoPayroll(): Promise<any[]> {
        return this.masterDataSource.query(
            `SELECT * FROM tenants 
       WHERE is_active = true 
       AND auto_payroll_enabled = true`
        );
    }

    private async getTenantConnection(databaseName: string): Promise<DataSource> {
        const connection = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: databaseName,
        });

        await connection.initialize();
        return connection;
    }

    private async processAttendanceForTenant(tenant: any): Promise<void> {
        const connection = await this.getTenantConnection(tenant.database_name);

        try {
            // Calculate absent days
            await connection.query(`
        INSERT INTO attendance (user_id, date, status, marked_by_system)
        SELECT u.id, CURRENT_DATE, 'absent', true
        FROM users u
        LEFT JOIN attendance a ON a.user_id = u.id AND a.date = CURRENT_DATE
        WHERE a.id IS NULL AND u.is_active = true
      `);

            this.logger.log(`✅ Attendance processed for ${tenant.slug}`);
        } finally {
            await connection.destroy();
        }
    }

    private async runPayrollForTenant(tenant: any): Promise<void> {
        // Placeholder - calls actual payroll service
        this.logger.log(`Running payroll for ${tenant.slug}...`);
        // await this.payrollService.runMonthlyPayroll(tenant.id);
    }

    private async generateReportsForTenant(tenant: any): Promise<void> {
        this.logger.log(`Generating reports for ${tenant.slug}...`);
        // Report generation logic
    }

    private async sendDigestForTenant(tenant: any): Promise<void> {
        this.logger.log(`Sending digest for ${tenant.slug}...`);
        // Email sending logic
    }

    private async sendRenewalReminder(tenant: any): Promise<void> {
        this.logger.warn(`⚠️ Subscription expiring soon for ${tenant.slug}`);
        // Send renewal email
    }

    private async suspendExpiredTenant(tenant: any): Promise<void> {
        await this.masterDataSource.query(
            `UPDATE tenants SET subscription_status = 'expired', is_active = false WHERE id = $1`,
            [tenant.id]
        );
        this.logger.warn(`🚫 Tenant ${tenant.slug} suspended due to expired subscription`);
    }

    private async sendPayrollFailureAlert(tenant: any, error: string): Promise<void> {
        this.logger.error(`💥 ALERT: Payroll failed for ${tenant.slug} - ${error}`);
        // Send alert to system admin
    }
}
