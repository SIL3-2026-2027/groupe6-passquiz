import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

/**
 * Intervalle de rafraîchissement de la cloche (ms).
 */
const POLL_INTERVAL = 30000;

const NotificationsContext = createContext(null);

/**
 * Notifications de l'utilisateur connecté, partagées par toutes les cloches de la page.
 */
export function NotificationsProvider({ children }) {
    const { user } = useAuth();
    const [state, setState] = useState({ items: [], unreadCount: 0 });

    const load = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications');
            setState({ items: data.data, unreadCount: data.meta.unread_count });
        } catch {
            // La cloche reste sur son dernier état si l'API ne répond pas.
        }
    }, []);

    useEffect(() => {
        if (!user) {
            setState({ items: [], unreadCount: 0 });

            return undefined;
        }

        load();
        const timer = setInterval(load, POLL_INTERVAL);

        return () => clearInterval(timer);
    }, [user, load]);

    const markAsRead = useCallback(async (notification) => {
        if (notification.read_at) {
            return;
        }

        setState((previous) => ({
            items: previous.items.map((item) => (item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item)),
            unreadCount: Math.max(0, previous.unreadCount - 1),
        }));
        await api.post(`/notifications/${notification.id}/read`).catch(() => load());
    }, [load]);

    const markAllAsRead = useCallback(async () => {
        setState((previous) => ({
            items: previous.items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })),
            unreadCount: 0,
        }));
        await api.post('/notifications/read-all').catch(() => load());
    }, [load]);

    const value = useMemo(() => ({ ...state, reload: load, markAsRead, markAllAsRead }), [state, load, markAsRead, markAllAsRead]);

    return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
    return useContext(NotificationsContext);
}
