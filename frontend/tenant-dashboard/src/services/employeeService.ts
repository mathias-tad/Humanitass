import api from './api';

/**
 * Employee Service
 * 
 * API calls for employee management.
 */

export interface Employee {
    id: string;
    email: string;
    full_name: string;
    position: string;
    department: string;
    hire_date: string;
    basic_salary: number;
    is_active: boolean;
}

export const employeeService = {
    /**
     * Get all employees with pagination
     */
    async getEmployees(params?: {
        page?: number;
        limit?: number;
        search?: string;
        department?: string;
    }) {
        const response = await api.get('/users', { params });
        return response.data;
    },

    /**
     * Get employee by ID
     */
    async getEmployee(id: string) {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Create new employee
     */
    async createEmployee(data: Partial<Employee>) {
        const response = await api.post('/users', data);
        return response.data;
    },

    /**
     * Update employee
     */
    async updateEmployee(id: string, data: Partial<Employee>) {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    /**
     * Delete employee
     */
    async deleteEmployee(id: string) {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};
