import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Employee List Component
 * 
 * Displays paginated list of employees with search and filtering.
 * Demonstrates modern React patterns and best practices.
 * 
 * Key Features:
 * - Pagination
 * - Real-time search
 * - Role filtering
 * - Loading states
 * - Error handling
 * - Responsive design
 */

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    department: string;
    position: string;
    basic_salary: number;
    is_active: boolean;
    created_at: string;
}

interface EmployeeListResponse {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const EmployeeList: React.FC = () => {
    const { token } = useAuth();

    // State management
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filter state
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input (avoid too many API calls)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on new search
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch employees
    useEffect(() => {
        fetchEmployees();
    }, [page, debouncedSearch, roleFilter]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit: 10,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(roleFilter && { role: roleFilter }),
            };

            const response = await axios.get<EmployeeListResponse>(
                `${process.env.REACT_APP_API_URL}/users`,
                {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setEmployees(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch employees');
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete employee (soft delete)
    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to deactivate this employee?')) {
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Refresh list
            fetchEmployees();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete employee');
        }
    };

    // Format salary for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="employee-list-container">
            {/* Header */}
            <div className="header">
                <h1>Employees</h1>
                <button className="btn-primary">+ Add Employee</button>
            </div>

            {/* Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="role-filter"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                </select>

                <span className="result-count">
                    {total} employee{total !== 1 ? 's' : ''} found
                </span>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading employees...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="error-message">
                    <p>⚠️ {error}</p>
                    <button onClick={fetchEmployees}>Retry</button>
                </div>
            )}

            {/* Employee Table */}
            {!loading && !error && (
                <>
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Salary</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.id} className={!employee.is_active ? 'inactive' : ''}>
                                    <td>{employee.full_name}</td>
                                    <td>{employee.email}</td>
                                    <td>
                                        <span className={`badge badge-${employee.role}`}>
                                            {employee.role}
                                        </span>
                                    </td>
                                    <td>{employee.department || '-'}</td>
                                    <td>{employee.position || '-'}</td>
                                    <td>{formatCurrency(employee.basic_salary)}</td>
                                    <td>
                                        <span className={`status ${employee.is_active ? 'active' : 'inactive'}`}>
                                            {employee.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-icon" title="View">
                                            👁️
                                        </button>
                                        <button className="btn-icon" title="Edit">
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            title="Delete"
                                            onClick={() => handleDelete(employee.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {employees.length === 0 && (
                        <div className="empty-state">
                            <p>No employees found</p>
                            <button className="btn-primary">Add Your First Employee</button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-page"
                            >
                                ← Previous
                            </button>

                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn-page"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EmployeeList;
