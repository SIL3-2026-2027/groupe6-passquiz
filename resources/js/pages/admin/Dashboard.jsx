import { Link } from 'react-router-dom';
import { Alert, AttemptStatusBadge, Badge, Card, Loading, PageHeader, ProgressBar, StatCard } from '../../components/ui';
import { formatDate, roleColors, roleLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Dashboard() {
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
            <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de la plateforme PassQuiz." />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Utilisateurs" value={data.counts.users} hint={`dont ${data.counts.learners} apprenants`} />
                <StatCard label="Formations" value={data.counts.formations} />
                <StatCard label="Cours" value={data.counts.courses} />
                <StatCard label="Quiz" value={data.counts.quizzes} />
                <StatCard label="Certificats" value={data.counts.certificates} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card>
                    <h2 className="font-semibold text-slate-900">Taux de réussite</h2>
                    <p className="mt-4 text-5xl font-black text-blue-900">{data.success_rate.percent} %</p>
                    <p className="mt-2 text-sm text-slate-500">
                        {data.success_rate.passed_attempts} réussite(s) sur {data.success_rate.submitted_attempts} évaluation(s) passée(s)
                    </p>
                    <div className="mt-4">
                        <ProgressBar percent={data.success_rate.percent} />
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Formations populaires</h2>
                        <Link to="/admin/statistics" className="text-sm text-blue-900 hover:underline">
                            Statistiques →
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {data.popular_formations.map((formation) => (
                            <Link key={formation.id} to={`/admin/formations/${formation.id}`} className="group">
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="font-medium text-slate-800 group-hover:text-blue-900">{formation.title}</span>
                                    <span className="text-slate-500">
                                        {formation.enrollments_count} inscrit(s) · {formation.certificates_count} certificat(s)
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-2 rounded-full bg-blue-900" style={{ width: `${(formation.enrollments_count / maxEnrollments) * 100}%` }} />
                                </div>
                            </Link>
                        ))}
                        {data.popular_formations.length === 0 && <p className="text-sm text-slate-500">Aucune formation.</p>}
                    </div>
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="p-0">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">Derniers utilisateurs</h2>
                        <Link to="/admin/users" className="text-sm text-blue-900 hover:underline">
                            Tout voir →
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {data.latest_users.map((user) => (
                            <li key={user.id}>
                                <Link to={`/admin/users/${user.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                                    <div>
                                        <p className="font-medium text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {user.email} · inscrit le {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                    <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-0">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">Dernières tentatives</h2>
                        <Link to="/admin/attempts" className="text-sm text-blue-900 hover:underline">
                            Tout voir →
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {data.latest_attempts.map((attempt) => (
                            <li key={attempt.id}>
                                <Link to={`/admin/attempts/${attempt.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                                    <div>
                                        <p className="font-medium text-slate-900">{attempt.user.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {attempt.quiz.formation.title} · {formatDate(attempt.submitted_at, true)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="font-bold whitespace-nowrap text-slate-900">{attempt.score} %</span>
                                        <AttemptStatusBadge attempt={attempt} />
                                    </div>
                                </Link>
                            </li>
                        ))}
                        {data.latest_attempts.length === 0 && <li className="px-5 py-3 text-sm text-slate-500">Aucune tentative pour le moment.</li>}
                    </ul>
                </Card>
            </div>
        </>
    );
}
