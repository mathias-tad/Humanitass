import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

/**
 * User Entity (Tenant Database)
 * 
 * Represents an employee/user within a specific tenant's organization.
 * Each tenant has their own `users` table in their dedicated database.
 * 
 * Key Design Decisions:
 * - UUID for primary keys (better for distributed systems)
 * - Soft deletes via is_active flag
 * - Password reset token with expiration
 * - Role-based access control support
 */
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password_hash: string;

    @Column()
    full_name: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ default: 'employee' })
    role: string; // 'admin', 'manager', 'employee', etc.

    @Column({ nullable: true })
    department: string;

    @Column({ nullable: true })
    position: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    basic_salary: number;

    @Column({ default: true })
    is_active: boolean;

    @Column({ default: false })
    is_password_set: boolean;

    // Password Reset
    @Column({ nullable: true })
    password_reset_token: string;

    @Column({ type: 'timestamp', nullable: true })
    password_reset_expires_at: Date;

    // Session Management
    @Column({ type: 'text', nullable: true })
    refresh_token: string;

    @Column({ type: 'timestamp', nullable: true })
    last_login_at: Date;

    // Profile
    @Column({ type: 'text', nullable: true })
    avatar_url: string;

    // Employee Category (for payroll)
    @Column({ type: 'uuid', nullable: true })
    employee_category_id: string;

    // Metadata
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    /**
     * Relations - Commented out to keep this sample simple
     * In production, these would link to other entities
     */
    // @ManyToOne(() => EmployeeCategory)
    // @JoinColumn({ name: 'employee_category_id' })
    // category: EmployeeCategory;

    // @ManyToOne(() => Role)
    // @JoinColumn({ name: 'role_id' })
    // roleDetails: Role;
}


/**
 * Employee Category Entity
 * 
 * Defines categories of employees (Management, Field, General)
 * Used for applying category-specific rules (allowances, policies)
 */
@Entity('employee_categories')
export class EmployeeCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    slug: string; // 'management', 'field', 'general'

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // Default Allowances
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    default_transport_allowance: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    default_per_diem_fixed: number;

    @Column({ default: false })
    is_system: boolean; // Prevent deletion of system categories

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

/**
 * Attendance Entity
 * 
 * Tracks daily attendance records for employees.
 * Supports biometric device integration.
 */
@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'timestamp', nullable: true })
    check_in: Date;

    @Column({ type: 'timestamp', nullable: true })
    check_out: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    work_hours: number;

    @Column({ type: 'int', default: 0 })
    late_minutes: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ default: 'present' })
    status: string; // 'present', 'absent', 'leave', 'holiday'

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
