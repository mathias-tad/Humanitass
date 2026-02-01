import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource, Repository, Like, ILike } from 'typeorm';
import { DatabaseService } from '../database/database.service';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

/**
 * Users Service - Business Logic Layer
 * 
 * Handles all user-related operations with tenant isolation.
 * Implements repository pattern with TypeORM.
 * 
 * Key Responsibilities:
 * - CRUD operations on users
 * - Password hashing and validation
 * - Tenant-scoped queries
 * - Pagination and filtering
 * - Data validation and error handling
 */
@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) { }

    /**
     * Get repository for tenant's database
     * 
     * @param tenantId - Tenant UUID
     * @returns TypeORM Repository for User entity
     */
    private async getUserRepository(tenantId: string): Promise<Repository<User>> {
        const connection = await this.databaseService.getTenantConnectionById(tenantId);
        return connection.getRepository(User);
    }

    /**
     * Find all users with pagination and filtering
     * 
     * Implements:
     * - Pagination (offset-based)
     * - Search across name and email
     * - Role and department filtering
     * - Sorting
     * 
     * @param tenantId - Tenant UUID
     * @param query - Query parameters (page, limit, search, filters)
     * @returns Paginated user list with metadata
     */
    async findAll(tenantId: string, query: UserQueryDto) {
        const repository = await this.getUserRepository(tenantId);

        const {
            page = 1,
            limit = 10,
            search,
            role,
            department,
            is_active,
            sortBy = 'created_at',
            sortOrder = 'DESC',
        } = query;

        // Build query with filters
        const queryBuilder = repository.createQueryBuilder('user');

        // Search filter (case-insensitive)
        if (search) {
            queryBuilder.where(
                '(LOWER(user.full_name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        // Role filter
        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }

        // Department filter
        if (department) {
            queryBuilder.andWhere('user.department = :department', { department });
        }

        // Active status filter
        if (is_active !== undefined) {
            queryBuilder.andWhere('user.is_active = :is_active', { is_active });
        }

        // Sorting
        queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

        // Pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Execute query
        const [users, total] = await queryBuilder.getManyAndCount();

        return {
            data: users.map(user => this.sanitizeUser(user)), // Remove sensitive fields
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Find user by ID
     * 
     * @param tenantId - Tenant UUID
     * @param userId - User UUID
     * @returns User entity
     * @throws NotFoundException if user not found
     */
    async findOne(tenantId: string, userId: string): Promise<User> {
        const repository = await this.getUserRepository(tenantId);

        const user = await repository.findOne({
            where: { id: userId },
            relations: ['category'], // Load related employee category
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return this.sanitizeUser(user);
    }

    /**
     * Find user by email (for authentication)
     * 
     * @param tenantId - Tenant UUID
     * @param email - User email
     * @returns User entity with password hash
     */
    async findByEmail(tenantId: string, email: string): Promise<User | null> {
        const repository = await this.getUserRepository(tenantId);

        return repository.findOne({
            where: { email: email.toLowerCase() },
            select: ['id', 'email', 'password_hash', 'full_name', 'role', 'is_active'],
        });
    }

    /**
     * Create new user
     * 
     * @param tenantId - Tenant UUID
     * @param createUserDto - User data
     * @returns Created user
     * @throws ConflictException if email already exists
     */
    async create(tenantId: string, createUserDto: CreateUserDto): Promise<User> {
        const repository = await this.getUserRepository(tenantId);

        // Check for duplicate email
        const existingUser = await repository.findOne({
            where: { email: createUserDto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Create user entity
        const user = repository.create({
            ...createUserDto,
            email: createUserDto.email.toLowerCase(),
            is_password_set: false, // User needs to set password
        });

        // Save to database
        const savedUser = await repository.save(user);

        // TODO: Send account setup email
        // await this.emailService.sendAccountSetup(savedUser.email);

        return this.sanitizeUser(savedUser);
    }

    /**
     * Update user
     * 
     * @param tenantId - Tenant UUID
     * @param userId - User UUID
     * @param updateUserDto - Updated fields
     * @returns Updated user
     */
    async update(
        tenantId: string,
        userId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        const repository = await this.getUserRepository(tenantId);

        // Find existing user
        const user = await repository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Merge updates
        Object.assign(user, updateUserDto);
        user.updated_at = new Date();

        // Save changes
        const updatedUser = await repository.save(user);

        return this.sanitizeUser(updatedUser);
    }

    /**
     * Soft delete user
     * 
     * Sets is_active = false instead of deleting.
     * Preserves historical data for payroll and attendance.
     * 
     * @param tenantId - Tenant UUID
     * @param userId - User UUID
     * @returns Success message
     */
    async softDelete(tenantId: string, userId: string): Promise<{ message: string }> {
        const repository = await this.getUserRepository(tenantId);

        const user = await repository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Soft delete
        user.is_active = false;
        user.updated_at = new Date();
        await repository.save(user);

        return { message: 'User deactivated successfully' };
    }

    /**
     * Get user statistics
     * 
     * @param tenantId - Tenant UUID
     * @returns Aggregated statistics
     */
    async getStatistics(tenantId: string) {
        const repository = await this.getUserRepository(tenantId);

        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            usersByRole,
            usersByDepartment,
        ] = await Promise.all([
            repository.count(),
            repository.count({ where: { is_active: true } }),
            repository.count({ where: { is_active: false } }),
            repository
                .createQueryBuilder('user')
                .select('user.role', 'role')
                .addSelect('COUNT(*)', 'count')
                .groupBy('user.role')
                .getRawMany(),
            repository
                .createQueryBuilder('user')
                .select('user.department', 'department')
                .addSelect('COUNT(*)', 'count')
                .where('user.department IS NOT NULL')
                .groupBy('user.department')
                .getRawMany(),
        ]);

        return {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            byRole: usersByRole,
            byDepartment: usersByDepartment,
        };
    }

    /**
     * Hash password using bcrypt
     * 
     * @param password - Plain text password
     * @returns Hashed password
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12; // High security
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Validate password
     * 
     * @param plainPassword - Plain text password
     * @param hashedPassword - Hashed password from database
     * @returns true if valid, false otherwise
     */
    async validatePassword(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Remove sensitive fields from user object
     * 
     * @param user - User entity
     * @returns Sanitized user object
     */
    private sanitizeUser(user: User): User {
        const { password_hash, refresh_token, password_reset_token, ...sanitized } = user;
        return sanitized as User;
    }
}
