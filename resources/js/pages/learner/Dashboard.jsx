import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { Alert, AttemptStatusBadge, Button, Card, EmptyState, Loading, ProgressBar } from '../../components/ui';
import { downloadFile } from '../../lib/api';
import { formatDate } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Dashboard() {
    const { data, loading, error } = useApi('/dashboard');

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const firstName = data.user.name.split(' ')[0];

    return (
        <div className="flex flex-col gap-8">
            <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold">Bonjour {firstName} 👋</h1>
                <p className="mt-2 text-blue-100">Continuez votre apprentissage là où vous vous êtes arrêté.</p>
            </div>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mes formations</h2>
                    <Link to="/formations" className="text-sm font-medium text-blue-900 dark:text-blue-300 hover:underline">
                        Voir le catalogue →
                    </Link>
                </div>
                {data.formations.length === 0 ? (
                    <EmptyState
                        title="Vous n'êtes inscrit à aucune formation"
                        description="Choisissez une formation pour commencer."
                        action={<Button to="/formations">Découvrir les formations</Button>}
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {data.formations.map((formation) => (
                            <Link key={formation.id} to={`/formations/${formation.id}`}>
                                <Card className="transition hover:shadow-md hover:ring-blue-200 dark:hover:ring-blue-800">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formation.title}</h3>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {formation.progress.completed_courses}/{formation.progress.total_courses} cours
                                        </span>
                                    </div>
                                    <ProgressBar percent={formation.progress.percent} />
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
                <section>
                    <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Mes certificats</h2>
                    {data.certificates.length === 0 ? (
                        <EmptyState title="Aucun certificat pour le moment" description="Réussissez une évaluation finale pour obtenir votre certificat." />
                    ) : (
                        <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0">
                            {data.certificates.map((certificate) => (
                                <div key={certificate.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                            <Icon name="check" className="size-4" />
                                        </span>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{certificate.formation.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{certificate.number}</p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={() => downloadFile(certificate.download_url, `certificat-${certificate.number}.pdf`)}>
                                        PDF
                                    </Button>
                                </div>
                            ))}
                        </Card>
                    )}
                </section>

                <section>
                    <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Mes dernières évaluations</h2>
                    {data.latest_attempts.length === 0 ? (
                        <EmptyState title="Aucune évaluation passée" description="Vos résultats apparaîtront ici." />
                    ) : (
                        <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0">
                            {data.latest_attempts.map((attempt) => (
                                <Link key={attempt.id} to={`/attempts/${attempt.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{attempt.quiz.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {attempt.quiz.formation.title} · {formatDate(attempt.submitted_at, true)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="text-lg font-bold whitespace-nowrap text-slate-900 dark:text-slate-100">{attempt.score} %</span>
                                        <AttemptStatusBadge attempt={attempt} />
                                    </div>
                                </Link>
                            ))}
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
}
