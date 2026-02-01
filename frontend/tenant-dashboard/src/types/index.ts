/**
 * User Types
 */
export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    position?: string;
    department?: string;
    is_active: boolean;
    created_at: string;
}

/**
 * Employee Types
 */
export interface Employee {
    id: string;
    employee_code: string;
    full_name: string;
    email: string;
    phone?: string;
    position: string;
    department?: Department;
    category?: EmployeeCategory;
    hire_date: string;
    basic_salary: number;
    employment_status: 'active' | 'inactive' | 'terminated' | 'on-leave';
    is_active: boolean;
}

export interface Department {
    id: string;
    name: string;
    code?: string;
    manager_id?: string;
}

export interface EmployeeCategory {
    id: string;
    name: string;
    description?: string;
}

/**
 * Attendance Types
 */
export interface Attendance {
    id: string;
    user_id: string;
    date: string;
    check_in_time?: string;
    check_out_time?: string;
    status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
    overtime_hours: number;
}

/**
 * Leave Types
 */
export interface LeaveRequest {
    id: string;
    user: User;
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by?: string;
    created_at: string;
}

export interface LeaveType {
    id: string;
    name: string;
    days_per_year: number;
    requires_approval: boolean;
    is_paid: boolean;
}

/**
 * Payroll Types
 */
export interface Payroll {
    id: string;
    month: number;
    year: number;
    total_gross_salary: number;
    total_deductions: number;
    total_net_salary: number;
    total_employees: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

export interface Payslip {
    id: string;
    user: User;
    payroll_id: string;
    gross_salary: number;
    deductions: number;
    net_salary: number;
    payment_date?: string;
}
