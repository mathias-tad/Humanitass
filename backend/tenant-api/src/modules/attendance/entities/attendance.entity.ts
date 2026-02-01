import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Attendance Entity
 * 
 * Stores daily attendance records for employees.
 */
@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @Column()
    user_id: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'time', nullable: true })
    check_in_time: string;

    @Column({ type: 'time', nullable: true })
    check_out_time: string;

    @Column({
        type: 'enum',
        enum: ['present', 'absent', 'late', 'half-day', 'leave'],
        default: 'present'
    })
    status: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    overtime_hours: number;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    check_in_latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    check_in_longitude: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ default: false })
    marked_by_system: boolean;

    @CreateDateColumn()
    created_at: Date;
}
