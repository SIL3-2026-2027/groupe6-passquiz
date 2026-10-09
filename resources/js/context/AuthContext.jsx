import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

    useEffect(() => {
        if (!localStorage.getItem(TOKEN_KEY)) {
            return;
        }

        api.get('/auth/me')
            .then(({ data }) => setUser(data.data))
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setLoading(false));
    }, []);

    const saveSession = useCallback(({ token, user: authenticatedUser }) => {
        localStorage.setItem(TOKEN_KEY, token);
        setUser(authenticatedUser);

        return authenticatedUser;
    }, []);

    const login = useCallback(
        async (credentials) => saveSession((await api.post('/auth/login', credentials)).data),
        [saveSession],
    );

    const register = useCallback(
        async (values) => saveSession((await api.post('/auth/register', values)).data),
        [saveSession],
    );

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, setUser, loading, login, register, logout, isAdmin: user?.role === 'admin', isStaff: ['admin', 'trainer'].includes(user?.role) }),
        [user, loading, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
