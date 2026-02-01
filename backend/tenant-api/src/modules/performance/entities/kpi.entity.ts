import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * KPI (Key Performance Indicator) Entity
 * 
 * Defines performance metrics for employees.
 */
@Entity('performance_kpis')
export class PerformanceKPI {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @Column()
    user_id: string;

    @Column()
    kpi_name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    target_value: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    actual_value: number;

    @Column()
    unit: string; // percentage, number, currency

    @Column({ type: 'date' })
    period_start: Date;

    @Column({ type: 'date' })
    period_end: Date;

    @Column({
        type: 'enum',
        enum: ['not-started', 'in-progress', 'completed', 'overdue'],
        default: 'not-started'
    })
    status: string;

    @Column({ nullable: true })
    reviewed_by: string;

    @Column({ type: 'text', nullable: true })
    comments: string;

    @CreateDateColumn()
    created_at: Date;
}
