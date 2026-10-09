import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AttemptStatusBadge, Button, Card, Loading, PageHeader, ProgressBar, StatCard, Table, Td } from '../../components/ui';
import api, { errorMessage } from '../../lib/api';
import { formatDate } from '../../lib/format';

import useApi from '../../lib/useApi';

export default function QuizShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [state, setState] = useState({ starting: false, error: null });
    const { data: quiz, meta, loading, error } = useApi(`/quizzes/${id}`);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const inProgress = meta.attempts.find((attempt) => attempt.status === 'in_progress');
    const coursesRemaining = quiz.requires_course_completion && meta.is_enrolled && meta.progress.percent < 100;

    const start = async () => {
        setState({ starting: true, error: null });

        try {
            const { data } = await api.post(`/quizzes/${quiz.id}/attempts`);
            navigate(`/attempts/${data.data.id}`);
        } catch (exception) {
            setState({ starting: false, error: exception.response?.data?.errors?.quiz?.[0] ?? errorMessage(exception) });
        }
    };

    return (
        <>
            <PageHeader back={{ to: `/formations/${quiz.formation.id}`, label: `Formation ${quiz.formation.title}` }} title={quiz.title} subtitle={quiz.description} />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Questions" value={quiz.questions_count} />
                <StatCard label="Score requis" value={`${quiz.passing_score}/100`} />
                <StatCard label="Durée" value={quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'Libre'} />
                <StatCard
                    label="Tentatives restantes"
                    value={meta.remaining_attempts ?? '∞'}
                    hint={
                        meta.best_score !== null
                            ? `Meilleur score : ${meta.best_score}/100`
                            : quiz.retry_delay_minutes
                              ? `${quiz.retry_delay_minutes} min d'attente après un échec`
                              : undefined
                    }
                />
            </div>

            <Card className="mb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {meta.has_passed ? (
                            <p className="font-semibold text-emerald-700">✓ Formation réussie ! Votre certificat est disponible.</p>
                        ) : !meta.is_enrolled ? (
                            <p className="text-slate-600">Inscrivez-vous à la formation pour passer l'évaluation.</p>
                        ) : meta.can_attempt || inProgress ? (
                            <p className="text-slate-600">
                                Répondez à toutes les questions. Il faut obtenir au moins <strong>{quiz.passing_score}/100</strong> pour réussir et obtenir le certificat.
                                {quiz.time_limit_minutes && ` Vous disposez de ${quiz.time_limit_minutes} minutes.`}
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <p className="text-slate-600">{meta.blocking_reason}</p>
                                {coursesRemaining && (
                                    <div className="max-w-sm">
                                        <p className="mb-1 text-xs text-slate-500">
                                            {meta.progress.completed_courses}/{meta.progress.total_courses} cours terminés
                                        </p>
                                        <ProgressBar percent={meta.progress.percent} size="sm" />
                                    </div>
                                )}
                            </div>
                        )}
                        <Alert className="mt-3">{state.error}</Alert>
                    </div>
                    <div className="shrink-0">
                        {meta.has_passed && <Button to="/certificates">Voir mes certificats</Button>}
                        {!meta.has_passed && (!meta.is_enrolled || coursesRemaining) && <Button to={`/formations/${quiz.formation.id}`}>{meta.is_enrolled ? 'Continuer les cours' : 'Aller à la formation'}</Button>}
                        {!meta.has_passed && meta.is_enrolled && (inProgress || meta.can_attempt) && (
                            <Button size="lg" onClick={start} loading={state.starting}>
                                {inProgress ? "Reprendre l'évaluation" : meta.attempts.length > 0 ? 'Nouvelle tentative' : "Commencer l'évaluation"}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {meta.attempts.length > 0 && (
                <>
                    <h2 className="mb-3 text-lg font-bold text-slate-900">Mes tentatives</h2>
                    <Table headers={['Tentative', 'Date', 'Score', 'Statut', '']}>
                        {meta.attempts.map((attempt) => (
                            <tr key={attempt.id}>
                                <Td>n° {attempt.attempt_number}</Td>
                                <Td>{formatDate(attempt.submitted_at ?? attempt.started_at, true)}</Td>
                                <Td className="font-semibold">{attempt.score !== null ? `${attempt.score}/100` : '—'}</Td>
                                <Td>
                                    <AttemptStatusBadge attempt={attempt} />
                                </Td>
                                <Td className="text-right">
                                    <Button variant="ghost" size="sm" to={`/attempts/${attempt.id}`}>
                                        Détails
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                </>
            )}
        </>
    );
}
