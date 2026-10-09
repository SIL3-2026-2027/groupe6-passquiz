import { Link } from 'react-router-dom';
import FormationCover from '../../components/FormationCover';
import { Alert, Badge, EmptyState, Loading, PageHeader, ProgressBar } from '../../components/ui';
import { levelLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Formations() {
    const { data, loading, error } = useApi('/formations');

    return (
        <>
            <PageHeader title="Formations" subtitle="Choisissez une formation, suivez les cours puis passez l'évaluation finale." />
            {loading && <Loading />}
            <Alert>{error}</Alert>
            {data?.length === 0 && <EmptyState title="Aucune formation disponible pour le moment" />}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data?.map((formation) => (
                    <Link
                        key={formation.id}
                        to={`/formations/${formation.id}`}
                        className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <FormationCover formation={formation} />
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-lg font-bold text-slate-900">{formation.title}</h2>
                                <Badge color="blue">{levelLabels[formation.level]}</Badge>
                            </div>
                            <p className="line-clamp-3 flex-1 text-sm text-slate-600">{formation.description}</p>
                            <p className="text-xs text-slate-500">
                                {formation.modules_count} modules · {formation.courses_count} cours
                            </p>
                            {formation.is_enrolled ? <ProgressBar percent={formation.progress.percent} size="sm" /> : <span className="text-sm font-semibold text-blue-900">Découvrir →</span>}
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
