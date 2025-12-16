export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
import Cookies from 'js-cookie';

export interface ApiResponse<T = any> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Client-side Cookie header injection
    const token = Cookies.get('accessToken');
    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        // credentials: 'include', // Not needed for manual bearer token unless CORS requires cookies for other reasons
    });

    // Check for 401 - Unauthenticated
    if (response.status === 401 && typeof window !== 'undefined') {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        // Only redirect if explicit auth was required (default) or if we are not suppressing it.
        // Actually, we can just check an option.
        if (options && (options as any).redirectOn401 === false) {
            throw new Error('Unauthorized');
        }

        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    let data: any;
    try {
        data = await response.json();
    } catch (error) {
        if (!response.ok) throw new Error(response.statusText);
        return {} as T; // Empty response?
    }

    // Handle Standardized Error Payload
    if (!response.ok) {
        if (data && data.message) {
            throw new Error(data.message);
        }
        throw new Error(`Request failed with status ${response.status}`);
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
