/**
 * Form Validators
 */

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
};

export const isValidPassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password);
};

export const isValidSalary = (salary: number): boolean => {
    return salary > 0 && !isNaN(salary);
};

/**
 * Date Validators
 */

export const isValidDateRange = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
};

export const isAfterToday = (date: string): boolean => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today;
};

/**
 * Required Fields Validator
 */

export const validateRequired = (value: any): string | null => {
    if (value === null || value === undefined || value === '') {
        return 'This field is required';
    }
    return null;
};

export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): Record<string, string> => {
    const errors: Record<string, string> = {};

    requiredFields.forEach(field => {
        const error = validateRequired(data[field]);
        if (error) {
            errors[field] = error;
        }
    });

    return errors;
};
