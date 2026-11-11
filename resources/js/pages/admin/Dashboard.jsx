import { Link } from 'react-router-dom';
import { Alert, AttemptStatusBadge, Badge, Card, Loading, PageHeader, ProgressBar, StatCard } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { formatDate, roleColors, roleLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

/**
 * Formations en brouillon : à valider par l'administrateur, en attente de validation pour le formateur.
 */
function PendingFormations({ formations, isAdmin }) {
    if (formations.length === 0) {
        return null;
    }

    return (
        <Card className="mt-6 border-l-4 border-amber-500 p-0">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{isAdmin ? 'Formations à valider' : 'Mes formations en attente de validation'}</h2>
                <Link to="/admin/formations" className="text-sm text-blue-900 dark:text-blue-300 hover:underline">
                    Tout voir →
                </Link>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {formations.map((formation) => (
                    <li key={formation.id}>
                        <Link to={`/admin/formations/${formation.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{formation.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {formation.trainer ? `Formateur : ${formation.trainer.name}` : 'Sans formateur'} · créée le {formatDate(formation.created_at)}
                                </p>
                            </div>
                            <Badge color="amber">En attente de validation</Badge>
                        </Link>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

export default function Dashboard() {
    const { isAdmin } = useAuth();
    const { data, loading, error } = useApi('/admin/dashboard');

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const maxEnrollments = Math.max(1, ...data.popular_formations.map((formation) => formation.enrollments_count));

    return (
        <>
            <PageHeader
                title={isAdmin ? 'Tableau de bord' : 'Espace formateur'}
                subtitle={isAdmin ? "Vue d'ensemble de la plateforme PassQuiz." : 'Vos formations, vos apprenants et leurs résultats.'}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {isAdmin ? (
                    <StatCard label="Utilisateurs" value={data.counts.users} hint={`dont ${data.counts.learners} apprenants`} />
                ) : (
                    <StatCard label="Apprenants inscrits" value={data.counts.users} hint="à vos formations" />
                )}
                <StatCard label="Formations" value={data.counts.formations} />
                <StatCard label="Cours" value={data.counts.courses} />
                <StatCard label="Quiz" value={data.counts.quizzes} />
                <StatCard label="Certificats" value={data.counts.certificates} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">Taux de réussite</h2>
                    <p className="mt-4 text-5xl font-black text-blue-900 dark:text-blue-300">{data.success_rate.percent} %</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {data.success_rate.passed_attempts} réussite(s) sur {data.success_rate.submitted_attempts} évaluation(s) passée(s)
                    </p>
                    <div className="mt-4">
                        <ProgressBar percent={data.success_rate.percent} />
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Formations populaires</h2>
                        <Link to="/admin/statistics" className="text-sm text-blue-900 dark:text-blue-300 hover:underline">
                            Statistiques →
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {data.popular_formations.map((formation) => (
                            <Link key={formation.id} to={`/admin/formations/${formation.id}`} className="group">
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-900 dark:group-hover:text-blue-300">{formation.title}</span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {formation.enrollments_count} inscrit(s) · {formation.certificates_count} certificat(s)
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className="h-2 rounded-full bg-blue-900 dark:bg-blue-600" style={{ width: `${(formation.enrollments_count / maxEnrollments) * 100}%` }} />
                                </div>
                            </Link>
                        ))}
                        {data.popular_formations.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Aucune formation.</p>}
                    </div>
                </Card>
            </div>

            <PendingFormations formations={data.pending_formations} isAdmin={isAdmin} />

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="p-0">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">{isAdmin ? 'Derniers utilisateurs' : 'Derniers apprenants inscrits'}</h2>
                        {isAdmin && (
                            <Link to="/admin/users" className="text-sm text-blue-900 dark:text-blue-300 hover:underline">
                                Tout voir →
                            </Link>
                        )}
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.latest_users.map((user) => (
                            <li key={user.id}>
                                <Link to={`/admin/users/${user.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {user.email} · inscrit le {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                    <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                                </Link>
                            </li>
                        ))}
                        {data.latest_users.length === 0 && <li className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">Aucun apprenant pour le moment.</li>}
                    </ul>
                </Card>

                <Card className="p-0">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Dernières tentatives</h2>
                        <Link to="/admin/attempts" className="text-sm text-blue-900 dark:text-blue-300 hover:underline">
                            Tout voir →
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.latest_attempts.map((attempt) => (
                            <li key={attempt.id}>
                                <Link to={`/admin/attempts/${attempt.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{attempt.user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {attempt.quiz.title} · {formatDate(attempt.submitted_at, true)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="font-bold whitespace-nowrap text-slate-900 dark:text-slate-100">{attempt.score} %</span>
                                        <AttemptStatusBadge attempt={attempt} />
                                    </div>
                                </Link>
                            </li>
                        ))}
                        {data.latest_attempts.length === 0 && <li className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">Aucune tentative pour le moment.</li>}
                    </ul>
                </Card>
            </div>
        </>
    );
}
