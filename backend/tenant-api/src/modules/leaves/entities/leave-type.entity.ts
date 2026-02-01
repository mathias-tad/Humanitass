import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Leave Type Entity
 * 
 * Defines types of leaves (Annual, Sick, Personal, etc.)
 */
@Entity('leave_types')
export class LeaveType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int' })
    days_per_year: number;

    @Column({ default: true })
    requires_approval: boolean;

    @Column({ default: false })
    is_paid: boolean;

    @Column({ default: true })
    carryover_allowed: boolean;

    @Column({ type: 'int', default: 0 })
    max_carryover_days: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
