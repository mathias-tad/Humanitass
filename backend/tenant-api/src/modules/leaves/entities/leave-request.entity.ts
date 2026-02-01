import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeaveType } from './leave-type.entity';

/**
 * Leave Request Entity
 * 
 * Manages employee leave/vacation requests.
 */
@Entity('leave_requests')
export class LeaveRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @Column()
    user_id: string;

    @ManyToOne(() => LeaveType)
    leave_type: LeaveType;

    @Column()
    leave_type_id: string;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({ type: 'int' })
    total_days: number;

    @Column({ type: 'text' })
    reason: string;

    @Column({
        type: 'enum',
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    })
    status: string;

    @Column({ nullable: true })
    approved_by: string;

    @Column({ type: 'timestamp', nullable: true })
    approved_at: Date;

    @Column({ type: 'text', nullable: true })
    rejection_reason: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
