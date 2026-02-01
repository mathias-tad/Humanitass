import { useState, useEffect } from 'react';

/**
 * Custom Hook: useDebounce
 * 
 * Debounces a value to reduce API calls.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom Hook: usePagination
 * 
 * Manages pagination state.
 */
export function usePagination(initialPage: number = 1, initialLimit: number = 10) {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [totalPages, setTotalPages] = useState(1);

    const goToPage = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const nextPage = () => goToPage(page + 1);
    const prevPage = () => goToPage(page - 1);

    return {
        page,
        limit,
        totalPages,
        setPage,
        setLimit,
        setTotalPages,
        goToPage,
        nextPage,
        prevPage,
    };
}

/**
 * Custom Hook: useLocalStorage
 * 
 * Syncs state with localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue] as const;
}
