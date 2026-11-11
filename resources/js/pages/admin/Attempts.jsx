import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AttemptStatusBadge, Button, Loading, PageHeader, Pagination, Select, Table, Td } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api, { errorMessage } from '../../lib/api';
import { formatDate } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Attempts() {
    const { isAdmin } = useAuth();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('user_id');
    const [filters, setFilters] = useState({ formation_id: '', status: '', page: 1 });
    const params = Object.fromEntries(Object.entries({ ...filters, user_id: userId ?? '' }).filter(([, value]) => value !== ''));
    const { data, meta, loading, error, reload } = useApi('/admin/attempts', params);
    const { data: formations } = useApi('/admin/formations', { per_page: 100 });
    const [actionError, setActionError] = useState(null);

    const setFilter = (name, value) => setFilters({ ...filters, [name]: value, page: 1 });

    const remove = async (attempt) => {
        if (!window.confirm(`Supprimer la tentative n° ${attempt.attempt_number} de ${attempt.user.name} ? L'apprenant récupère une tentative.`)) {
            return;
        }

        try {
            await api.delete(`/admin/attempts/${attempt.id}`);
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    return (
        <>
            <PageHeader
                title="Résultats"
                subtitle={userId && data?.[0] ? `Tentatives de ${data[0].user.name}` : isAdmin ? 'Toutes les tentatives aux évaluations.' : 'Les tentatives des apprenants inscrits à vos formations.'}
                actions={userId && <Button variant="secondary" to="/admin/attempts">Voir tous les résultats</Button>}
            />

            <div className="mb-4 grid max-w-2xl gap-3 sm:grid-cols-2">
                <Select
                    name="formation_id"
                    value={filters.formation_id}
                    onChange={(event) => setFilter('formation_id', event.target.value)}
                    placeholder="Toutes les formations"
                    options={(formations ?? []).map((formation) => ({ value: formation.id, label: formation.title }))}
                />
                <Select
                    name="status"
                    value={filters.status}
                    onChange={(event) => setFilter('status', event.target.value)}
                    placeholder="Tous les statuts"
                    options={[
                        { value: 'passed', label: 'Réussi' },
                        { value: 'failed', label: 'À reprendre' },
                        { value: 'in_progress', label: 'En cours' },
                    ]}
                />
            </div>

            <Alert className="mb-4">{error ?? actionError}</Alert>

            {loading && !data ? (
                <Loading />
            ) : (
                <>
                    <Table headers={['Apprenant', 'Évaluation', 'Tentative', 'Date', 'Score', 'Statut', '']}>
                        {data?.map((attempt) => (
                            <tr key={attempt.id}>
                                <Td>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{attempt.user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{attempt.user.email}</p>
                                </Td>
                                <Td>
                                    <p className="text-slate-900 dark:text-slate-100">{attempt.quiz.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Formation {attempt.quiz.formation.title}</p>
                                </Td>
                                <Td>n° {attempt.attempt_number}</Td>
                                <Td>{formatDate(attempt.submitted_at ?? attempt.started_at, true)}</Td>
                                <Td className="font-semibold">{attempt.score !== null ? `${attempt.score}/100` : '—'}</Td>
                                <Td>
                                    <AttemptStatusBadge attempt={attempt} />
                                </Td>
                                <Td className="text-right whitespace-nowrap">
                                    <Button variant="ghost" size="sm" to={`/admin/attempts/${attempt.id}`}>
                                        Détails
                                    </Button>
                                    {isAdmin && (
                                        <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400" onClick={() => remove(attempt)}>
                                            Supprimer
                                        </Button>
                                    )}
                                </Td>
                            </tr>
                        ))}
                    </Table>
                    {data?.length === 0 && <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">Aucun résultat.</p>}
                    <Pagination meta={meta} onPageChange={(page) => setFilters({ ...filters, page })} />
                </>
            )}
        </>
    );
}
