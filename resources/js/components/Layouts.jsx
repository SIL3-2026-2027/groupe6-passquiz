import { useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePath } from '../lib/format';
import Icon from './Icon';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { Loading } from './ui';

function useLogout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return async () => {
        await logout();
        navigate('/login');
    };
}

/**
 * Pages accessibles uniquement aux visiteurs non connectés (connexion, inscription...).
 */
export function GuestLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (user) {
        return <Navigate to={homePath(user)} replace />;
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 px-4 py-12 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
            <div className="absolute top-4 right-4">
                <ThemeToggle className="text-blue-100 hover:bg-white/10 hover:text-white" />
            </div>
            <div className="mb-8">
                <Logo light />
            </div>
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
                <Outlet />
            </div>
            <p className="mt-8 text-center text-sm text-blue-100">Apprenez Laravel et React, validez vos connaissances, obtenez votre certificat.</p>
            <Link to="/verify" className="mt-2 text-sm font-medium text-white underline-offset-4 hover:underline">
                Vérifier un certificat
            </Link>
        </div>
    );
}

/**
 * Vérifie la connexion, et le rôle si demandé : `staff` (formateur ou admin) ou `admin`.
 */
export function RequireAuth({ admin = false, staff = false, children }) {
    const { user, loading, isAdmin, isStaff } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if ((admin && !isAdmin) || (staff && !isStaff)) {
        return <Navigate to={homePath(user)} replace />;
    }

    return children;
}

export function HomeRedirect() {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to={homePath(user)} replace />;
}

const learnerLinks = [
    { to: '/dashboard', label: 'Tableau de bord' },
    { to: '/formations', label: 'Formations' },
    { to: '/attempts', label: 'Mes scores' },
    { to: '/certificates', label: 'Mes certificats' },
];

export function LearnerLayout() {
    const { user, isAdmin, isStaff } = useAuth();
    const logout = useLogout();
    const [menuOpen, setMenuOpen] = useState(false);

    const linkClass = ({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`;

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                    <Logo to="/dashboard" />
                    <nav className="hidden items-center gap-1 md:flex">
                        {learnerLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} className={linkClass}>
                                {link.label}
                            </NavLink>
                        ))}
                        {isStaff && (
                            <NavLink to="/admin" className={linkClass}>
                                {isAdmin ? 'Administration' : 'Espace formateur'}
                            </NavLink>
                        )}
                    </nav>
                    <div className="hidden items-center gap-1 md:flex">
                        <ThemeToggle />
                        <NotificationBell />
                        <NavLink to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Icon name="user" />
                            {user.name}
                        </NavLink>
                        <button type="button" onClick={logout} className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400" title="Déconnexion">
                            <Icon name="logout" />
                        </button>
                    </div>
                    <div className="flex items-center gap-1 md:hidden">
                        <ThemeToggle />
                        <NotificationBell />
                        <button type="button" className="rounded-lg p-2 text-slate-600 dark:text-slate-400" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                            <Icon name={menuOpen ? 'x' : 'menu'} />
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <nav className="flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 px-4 py-3 md:hidden" onClick={() => setMenuOpen(false)}>
                        {learnerLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} className={linkClass}>
                                {link.label}
                            </NavLink>
                        ))}
                        {isStaff && (
                            <NavLink to="/admin" className={linkClass}>
                                {isAdmin ? 'Administration' : 'Espace formateur'}
                            </NavLink>
                        )}
                        <NavLink to="/profile" className={linkClass}>
                            Mon profil
                        </NavLink>
                        <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40">
                            Déconnexion
                        </button>
                    </nav>
                )}
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}

/**
 * Liens de l'espace de gestion ; `trainerLabel` est le libellé affiché au formateur,
 * qui ne gère que ses propres formations.
 */
const adminLinks = [
    { to: '/admin', label: 'Tableau de bord', icon: 'home', end: true },
    { to: '/admin/statistics', label: 'Statistiques', icon: 'chart' },
    { to: '/admin/users', label: 'Utilisateurs', icon: 'users', adminOnly: true },
    { to: '/admin/formations', label: 'Formations & cours', trainerLabel: 'Mes formations & cours', icon: 'book' },
    { to: '/admin/quizzes', label: 'Quiz', trainerLabel: 'Mes quiz', icon: 'quiz' },
    { to: '/admin/attempts', label: 'Résultats', trainerLabel: 'Résultats des apprenants', icon: 'clipboard' },
    { to: '/admin/certificates', label: 'Certificats', icon: 'award', adminOnly: true },
];

export function AdminLayout() {
    const { user, isAdmin } = useAuth();
    const logout = useLogout();
    const [menuOpen, setMenuOpen] = useState(false);

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`;

    const sidebar = (
        <div className="flex h-full flex-col gap-6 bg-blue-950 px-4 py-6 dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
            <div className="flex items-start justify-between gap-2 px-2">
                <div>
                    <Logo to="/admin" light />
                    <p className="mt-1 text-xs text-blue-300">{isAdmin ? 'Administration' : 'Espace formateur'}</p>
                </div>
                <div className="-mr-2 hidden items-center lg:flex">
                    <ThemeToggle className="text-blue-100 hover:bg-white/10 hover:text-white" />
                    <NotificationBell align="left" className="text-blue-100 hover:bg-white/10 hover:text-white" />
                </div>
            </div>
            <nav className="flex flex-1 flex-col gap-1" onClick={() => setMenuOpen(false)}>
                {adminLinks.filter((link) => isAdmin || !link.adminOnly).map((link) => (
                    <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                        <Icon name={link.icon} />
                        {isAdmin ? link.label : (link.trainerLabel ?? link.label)}
                    </NavLink>
                ))}
            </nav>
            <div className="flex flex-col gap-1 border-t border-white/10 pt-4" onClick={() => setMenuOpen(false)}>
                <NavLink to="/formations" className={linkClass}>
                    <Icon name="play" />
                    Espace apprenant
                </NavLink>
                <NavLink to="/admin/profile" className={linkClass}>
                    <Icon name="user" />
                    {user.name}
                </NavLink>
                <button type="button" onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white">
                    <Icon name="logout" />
                    Déconnexion
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
            {menuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="w-64">{sidebar}</div>
                    <button type="button" className="flex-1 bg-slate-900/50" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" />
                </div>
            )}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:hidden">
                <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 dark:text-slate-400" aria-label="Menu">
                    <Icon name="menu" />
                </button>
                <Logo to="/admin" />
                <div className="ml-auto flex items-center gap-1">
                    <ThemeToggle />
                    <NotificationBell />
                </div>
            </header>
            <main className="px-4 py-8 lg:ml-64 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
