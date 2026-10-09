import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AttemptStatusBadge, Badge, Button, Card, Loading, PageHeader, StatCard } from '../../components/ui';
import api from '../../lib/api';
import { formatDate, questionTypeLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function AttemptShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: attempt, loading, error } = useApi(`/admin/attempts/${id}`);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const remove = async () => {
        if (window.confirm("Supprimer cette tentative ? L'apprenant récupère une tentative.")) {
            await api.delete(`/admin/attempts/${attempt.id}`);
            navigate('/admin/attempts');
        }
    };

    return (
        <>
            <PageHeader
                back={{ to: '/admin/attempts', label: 'Résultats' }}
                title={`${attempt.user.name} · ${attempt.quiz.formation.title}`}
                subtitle={`Tentative n° ${attempt.attempt_number} · commencée le ${formatDate(attempt.started_at, true)}`}
                actions={
                    <>
                        <Button variant="secondary" to={`/admin/users/${attempt.user.id}`}>
                            Profil de l'apprenant
                        </Button>
                        <Button variant="danger" onClick={remove}>
                            Supprimer
                        </Button>
                    </>
                }
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Score" value={attempt.score !== null ? `${attempt.score}/100` : '—'} hint={attempt.total_points ? `${attempt.earned_points} / ${attempt.total_points} points` : undefined} />
                <StatCard label="Score requis" value={`${attempt.passing_score}/100`} />
                <Card>
                    <p className="text-sm font-medium text-slate-500">Statut</p>
                    <div className="mt-3">
                        <AttemptStatusBadge attempt={attempt} />
                    </div>
                    {attempt.certificate && <p className="mt-2 font-mono text-xs text-slate-500">{attempt.certificate.number}</p>}
                </Card>
                <StatCard label="Soumise le" value={attempt.submitted_at ? formatDate(attempt.submitted_at) : '—'} />
            </div>

            <h2 className="mb-3 text-lg font-bold text-slate-900">Correction détaillée</h2>
            {attempt.answers.length === 0 && <p className="text-sm text-slate-500">Aucune réponse enregistrée (tentative en cours).</p>}
            <div className="flex flex-col gap-4">
                {attempt.answers.map((answer, index) => (
                    <Card key={answer.question_id} className={`border-l-4 ${answer.is_correct ? 'border-emerald-500' : 'border-red-500'}`}>
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                            <p className="font-semibold text-slate-900">
                                <span className="text-blue-900">Q{index + 1}.</span> {answer.question.text}
                            </p>
                            <div className="flex gap-2">
                                <Badge color={answer.question.type === 'multiple' ? 'purple' : 'gray'}>{questionTypeLabels[answer.question.type]}</Badge>
                                <Badge color={answer.is_correct ? 'green' : 'red'}>
                                    {answer.points_earned}/{answer.question.points} pt
                                </Badge>
                            </div>
                        </div>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {answer.question.answers.map((choice) => {
                                const chosen = answer.selected_answer_ids.includes(choice.id);
                                const style = choice.is_correct
                                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-300'
                                    : chosen
                                      ? 'bg-red-50 text-red-800 ring-red-300'
                                      : 'bg-slate-50 text-slate-600 ring-transparent';

                                return (
                                    <li key={choice.id} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ring-1 ${style}`}>
                                        <span>{choice.text}</span>
                                        <span className="text-xs font-semibold">
                                            {chosen && 'Choisie '}
                                            {choice.is_correct && '✓'}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                ))}
            </div>
        </>
    );
}
