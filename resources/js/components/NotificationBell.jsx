import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import { formatDate } from '../lib/format';
import Icon from './Icon';

/**
 * Cloche de notifications avec le nombre de non lues et la liste des dernières.
 * `align` place le panneau à gauche ou à droite du bouton ; `className` adapte le bouton au fond.
 */
export default function NotificationBell({
    align = 'right',
    className = 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
}) {
    const { items, unreadCount, reload, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const container = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const close = (event) => {
            if (event.type === 'keydown' ? event.key === 'Escape' : !container.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', close);

        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', close);
        };
    }, [open]);

    const toggle = () => {
        if (!open) {
            reload();
        }

        setOpen(!open);
    };

    const openNotification = (notification) => {
        markAsRead(notification);
        setOpen(false);

        if (notification.url) {
            navigate(notification.url);
        }
    };

    const label = unreadCount > 0 ? `Notifications (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})` : 'Notifications';

    return (
        <div ref={container} className="relative">
            <button type="button" onClick={toggle} className={`relative rounded-lg p-2 transition ${className}`} title={label} aria-label={label} aria-expanded={open}>
                <Icon name="bell" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] leading-5 font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className={`absolute z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 ${align === 'left' ? 'left-0' : 'right-0'}`}
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                        {unreadCount > 0 && (
                            <button type="button" onClick={markAllAsRead} className="text-xs font-medium text-blue-900 hover:underline dark:text-blue-300">
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                    <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                        {items.map((notification) => (
                            <li key={notification.id}>
                                <button
                                    type="button"
                                    onClick={() => openNotification(notification)}
                                    className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${notification.read_at ? '' : 'bg-blue-50/60 dark:bg-blue-950/40'}`}
                                >
                                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read_at ? 'bg-transparent' : 'bg-blue-600'}`} />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{notification.title}</span>
                                        <span className="block text-sm text-slate-600 dark:text-slate-400">{notification.message}</span>
                                        <span className="mt-1 block text-xs text-slate-400 dark:text-slate-500">{formatDate(notification.created_at, true)}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                        {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Aucune notification.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}
