/**
 * Application Constants
 */

export const APP_NAME = 'Humanitas ERP';
export const APP_VERSION = '1.0.0';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    USERS: '/users',
    EMPLOYEES: '/employees',
    ATTENDANCE: '/attendance',
    PAYROLL: '/payroll',
    LEAVES: '/leaves',
    PERFORMANCE: '/performance',
    REPORTS: '/reports',
};

/**
 * User Roles
 */
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
    HR: 'hr',
} as const;

/**
 * Employment Status
 */
export const EMPLOYMENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    TERMINATED: 'terminated',
    ON_LEAVE: 'on-leave',
} as const;

/**
 * Attendance Status
 */
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    HALF_DAY: 'half-day',
    LEAVE: 'leave',
} as const;

/**
 * Leave Request Status
 */
export const LEAVE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
} as const;

/**
 * Pagination
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    DATETIME: 'MMM dd, yyyy HH:mm',
};
