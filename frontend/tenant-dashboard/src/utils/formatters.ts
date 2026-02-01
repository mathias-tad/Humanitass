/**
 * Date/Time Formatters
 */

export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (date: string | Date): string => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Currency Formatters
 */

export const formatCurrency = (amount: number, currency: string = 'ETB'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Number Formatters
 */

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

/**
 * String Formatters
 */

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
    return str.length > length ? str.substring(0, length) + '...' : str;
};

/**
 * Status Badge Formatters
 */

export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        active: 'green',
        inactive: 'gray',
        pending: 'yellow',
        approved: 'green',
        rejected: 'red',
        present: 'green',
        absent: 'red',
        late: 'orange',
    };
    return colors[status.toLowerCase()] || 'gray';
};
