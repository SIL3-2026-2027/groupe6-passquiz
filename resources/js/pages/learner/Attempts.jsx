import { useState } from 'react';
import { Alert, AttemptStatusBadge, Button, EmptyState, Loading, PageHeader, Pagination, Table, Td } from '../../components/ui';
import { formatDate } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Attempts() {
    const [page, setPage] = useState(1);
    const { data, meta, loading, error } = useApi('/attempts', { page });

    return (
        <>
            <PageHeader title="Mes scores" subtitle="Historique de toutes vos évaluations." />
            <Alert>{error}</Alert>
            {loading && !data ? (
                <Loading />
            ) : data?.length === 0 ? (
                <EmptyState title="Aucune évaluation passée" action={<Button to="/formations">Voir les formations</Button>} />
            ) : (
                <>
                    <Table headers={['Évaluation', 'Tentative', 'Date', 'Score', 'Statut', '']}>
                        {data?.map((attempt) => (
                            <tr key={attempt.id}>
                                <Td>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{attempt.quiz.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Formation {attempt.quiz.formation.title}</p>
                                </Td>
                                <Td>n° {attempt.attempt_number}</Td>
                                <Td>{formatDate(attempt.submitted_at ?? attempt.started_at, true)}</Td>
                                <Td className="font-semibold">{attempt.score !== null ? `${attempt.score} %` : '—'}</Td>
                                <Td>
                                    <AttemptStatusBadge attempt={attempt} />
                                </Td>
                                <Td className="text-right">
                                    <Button variant="ghost" size="sm" to={`/attempts/${attempt.id}`}>
                                        {attempt.status === 'in_progress' ? 'Reprendre' : 'Détails'}
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                    <Pagination meta={meta} onPageChange={setPage} />
                </>
            )}
        </>
    );
}
