import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EmployeeCategory } from './employee-category.entity';
import { Department } from './department.entity';

/**
 * Employee Entity
 * 
 * Stores detailed employee information and organizational hierarchy.
 */
@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    employee_code: string;

    @Column()
    full_name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'date', nullable: true })
    date_of_birth: Date;

    @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
    gender: string;

    @ManyToOne(() => Department, { nullable: true })
    department: Department;

    @Column({ nullable: true })
    department_id: string;

    @Column({ nullable: true })
    position: string;

    @ManyToOne(() => EmployeeCategory)
    category: EmployeeCategory;

    @Column()
    category_id: string;

    @Column({ type: 'date' })
    hire_date: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    basic_salary: number;

    @Column({ type: 'enum', enum: ['active', 'inactive', 'terminated', 'on-leave'], default: 'active' })
    employment_status: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ nullable: true })
    emergency_contact_name: string;

    @Column({ nullable: true })
    emergency_contact_phone: string;

    @Column({ type: 'text', nullable: true })
    bank_account_number: string;

    @Column({ nullable: true })
    bank_name: string;

    @Column({ nullable: true })
    tax_identification_number: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
