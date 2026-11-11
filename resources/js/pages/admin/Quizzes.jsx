import { useState } from 'react';
import QuizFormModal from '../../components/admin/QuizFormModal';
import { Alert, Badge, Button, Loading, PageHeader, Pagination, Table, Td } from '../../components/ui';
import api, { errorMessage } from '../../lib/api';
import useApi from '../../lib/useApi';

export default function Quizzes() {
    const [page, setPage] = useState(1);
    const { data, meta, loading, error, reload } = useApi('/admin/quizzes', { page });
    const [editing, setEditing] = useState(null);
    const [actionError, setActionError] = useState(null);

    const remove = async (quiz) => {
        if (!window.confirm(`Supprimer « ${quiz.title} » ainsi que ses questions et tous les résultats associés ?`)) {
            return;
        }

        try {
            await api.delete(`/admin/quizzes/${quiz.id}`);
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    return (
        <>
            <PageHeader
                title="Quiz"
                subtitle="Un quiz par module et une évaluation finale par formation : score minimum, durée, tentatives et questions."
                actions={<Button onClick={() => setEditing({})}>+ Nouveau quiz</Button>}
            />
            <Alert className="mb-4">{error ?? actionError}</Alert>

            {loading && !data ? (
                <Loading />
            ) : (
                <>
                    <Table headers={['Quiz', 'Formation', 'Type', 'Questions', 'Score requis', 'Durée', 'Tentatives max', 'Passages', 'Statut', '']}>
                        {data?.map((quiz) => (
                            <tr key={quiz.id}>
                                <Td className="font-semibold text-slate-900 dark:text-slate-100">{quiz.title}</Td>
                                <Td>{quiz.formation.title}</Td>
                                <Td>{quiz.module ? <Badge>Module {quiz.module.number}</Badge> : <Badge color="blue">Évaluation finale</Badge>}</Td>
                                <Td>
                                    {quiz.questions_count} <span className="text-xs text-slate-500 dark:text-slate-400">({quiz.total_points} pts)</span>
                                </Td>
                                <Td>{quiz.passing_score}/100</Td>
                                <Td>{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : '—'}</Td>
                                <Td>{quiz.max_attempts ?? 'Illimité'}</Td>
                                <Td>{quiz.attempts_count}</Td>
                                <Td>{quiz.is_published ? <Badge color="green">Publiée</Badge> : <Badge color="amber">Brouillon</Badge>}</Td>
                                <Td className="text-right whitespace-nowrap">
                                    <Button variant="ghost" size="sm" to={`/admin/quizzes/${quiz.id}`}>
                                        Questions
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditing(quiz)}>
                                        Modifier
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400" onClick={() => remove(quiz)}>
                                        Supprimer
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                    {data?.length === 0 && <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">Aucun quiz.</p>}
                    <Pagination meta={meta} onPageChange={setPage} />
                </>
            )}

            {editing && (
                <QuizFormModal
                    quiz={editing.id ? editing : null}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        reload();
                    }}
                />
            )}
        </>
    );
}
