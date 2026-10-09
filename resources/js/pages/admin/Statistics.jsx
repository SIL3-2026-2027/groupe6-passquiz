import { Alert, Loading, PageHeader, ProgressBar, StatCard, Table, Td } from '../../components/ui';
import useApi from '../../lib/useApi';

export default function Statistics() {
    const { data, loading, error } = useApi('/admin/statistics');

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    return (
        <>
            <PageHeader title="Statistiques" subtitle="Résultats globaux et par formation." />

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Évaluations passées" value={data.global.attempts} />
                <StatCard label="Réussites" value={data.global.passed_attempts} />
                <StatCard label="Échecs" value={data.global.failed_attempts} />
                <StatCard label="Score moyen" value={data.global.average_score !== null ? `${data.global.average_score}/100` : '—'} />
                <StatCard label="Taux de réussite" value={`${data.global.success_rate} %`} />
            </div>

            <h2 className="mb-3 text-lg font-bold text-slate-900">Par formation</h2>
            <Table headers={['Formation', 'Inscrits', 'Terminées', 'Évaluations', 'Réussites', 'Score moyen', 'Certificats', 'Taux de réussite']}>
                {data.formations.map((formation) => (
                    <tr key={formation.id}>
                        <Td className="font-semibold text-slate-900">{formation.title}</Td>
                        <Td>{formation.enrollments}</Td>
                        <Td>{formation.completed_enrollments}</Td>
                        <Td>{formation.attempts}</Td>
                        <Td>{formation.passed_attempts}</Td>
                        <Td>{formation.average_score !== null ? `${formation.average_score}/100` : '—'}</Td>
                        <Td>{formation.certificates}</Td>
                        <Td className="min-w-48">
                            <ProgressBar percent={formation.success_rate} size="sm" />
                        </Td>
                    </tr>
                ))}
            </Table>
        </>
    );
}
