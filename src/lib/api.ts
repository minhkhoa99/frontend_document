export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
import Cookies from 'js-cookie';

export interface ApiResponse<T = any> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: HeadersInit = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        (headers as any)['Content-Type'] = 'application/json';
    }

    // Client-side Cookie header injection
    const token = Cookies.get('accessToken');
    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
        });
    } catch (error) {
        // Network error or failed to fetch
        console.error('Network Error:', error);
        throw new Error('Lỗi kết nối hoặc hệ thống. Vui lòng thử lại sau.');
    }

    // Check for 401 - Unauthenticated
    if (response.status === 401 && typeof window !== 'undefined') {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        if (options && (options as any).redirectOn401 === false) {
            throw new ApiError('Unauthorized', 401);
        }

        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        throw new ApiError('Unauthorized', 401);
    }

    let data: any;
    try {
        data = await response.json();
    } catch (error) {
        if (!response.ok) throw new ApiError(response.statusText, response.status);
        return {} as T; // Empty response?
    }

    // Handle Standardized Error Payload
    if (!response.ok) {
        // If 5xx Server Error or generic
        if (response.status >= 500) {
            throw new ApiError('Lỗi hệ thống. Vui lòng thử lại sau.', response.status);
        }

        if (data && data.message) {
            throw new ApiError(data.message, response.status);
        }
        throw new ApiError(`Request failed with status ${response.status}`, response.status);
    }

    // Handle Standardized Success Payload
    if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
            return data.data as T;
        } else {
            throw new Error(data.message || 'Operation failed');
        }
    }

    return data as T;
}
