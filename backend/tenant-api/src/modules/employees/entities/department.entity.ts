import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';

/**
 * Department Entity
 * 
 * Organizational departments/divisions.
 */
@Entity('departments')
export class Department {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    code: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    manager_id: string;

    @OneToMany(() => Employee, employee => employee.department)
    employees: Employee[];

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
