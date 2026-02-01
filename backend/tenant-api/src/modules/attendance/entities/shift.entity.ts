import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Shift Entity
 * 
 * Defines work shift schedules (morning, evening, night, etc.)
 */
@Entity('shifts')
export class Shift {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ type: 'int', default: 480 }) // 8 hours in minutes
    duration_minutes: number;

    @Column({ type: 'int', default: 15 }) // Grace period in minutes
    late_threshold_minutes: number;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
