import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: restore session from stored access token
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            api.get('auth/me/')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    /**
     * Backend response shape for both login & register:
     * { user: {...}, tokens: { access: "...", refresh: "..." } }
     */
    const login = async (username, password) => {
        const { data } = await api.post('auth/login/', { username, password });
        // tokens are nested under data.tokens
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        // user is returned directly in the response — no need for extra /me/ call
        setUser(data.user);
        return data.user;
    };

    const register = async (username, email, password) => {
        const { data } = await api.post('auth/register/', { username, email, password });
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
