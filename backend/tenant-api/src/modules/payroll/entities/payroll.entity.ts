import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Payroll Entity
 * 
 * Represents a monthly payroll run for the organization.
 */
@Entity('payroll')
export class Payroll {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({ type: 'date' })
    pay_period_start: Date;

    @Column({ type: 'date' })
    pay_period_end: Date;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    total_gross_salary: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    total_deductions: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    total_net_salary: number;

    @Column({ default: 0 })
    total_employees: number;

    @Column({
        type: 'enum',
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    })
    status: string;

    @Column({ nullable: true })
    processed_by: string;

    @CreateDateColumn()
    created_at: Date;
}
