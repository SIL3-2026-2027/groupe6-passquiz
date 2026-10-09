import { useState } from 'react';
import { useParams } from 'react-router-dom';
import QuestionFormModal from '../../components/admin/QuestionFormModal';
import QuizFormModal from '../../components/admin/QuizFormModal';
import { Alert, Badge, Button, Card, EmptyState, Loading, PageHeader, StatCard } from '../../components/ui';
import api, { errorMessage } from '../../lib/api';
import { questionTypeLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function QuizShow() {
    const { id } = useParams();
    const { data: quiz, loading, error, reload } = useApi(`/admin/quizzes/${id}`);
    const [modal, setModal] = useState(null);
    const [actionError, setActionError] = useState(null);

    if (loading && !quiz) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const closeAndReload = () => {
        setModal(null);
        reload();
    };

    const removeQuestion = async (question) => {
        if (!window.confirm('Supprimer cette question et ses réponses ?')) {
            return;
        }

        try {
            await api.delete(`/admin/questions/${question.id}`);
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    const nextPosition = Math.max(0, ...quiz.questions.map((question) => question.position)) + 1;

    return (
        <>
            <PageHeader
                back={{ to: `/admin/formations/${quiz.formation.id}`, label: `Formation ${quiz.formation.title}` }}
                title={quiz.title}
                subtitle={quiz.description}
                actions={
                    <>
                        <Button variant="secondary" onClick={() => setModal({ type: 'quiz' })}>
                            Paramètres
                        </Button>
                        <Button onClick={() => setModal({ type: 'question' })}>+ Ajouter une question</Button>
                    </>
                }
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Questions" value={quiz.questions_count} hint={`${quiz.total_points} points au total`} />
                <StatCard label="Score minimum" value={`${quiz.passing_score}/100`} />
                <StatCard label="Durée" value={quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'Libre'} />
                <StatCard
                    label="Tentatives max"
                    value={quiz.max_attempts ?? '∞'}
                    hint={quiz.retry_delay_minutes ? `Délai entre tentatives : ${quiz.retry_delay_minutes} min` : 'Sans délai entre tentatives'}
                />
                <StatCard label="Statut" value={quiz.is_published ? 'Publiée' : 'Brouillon'} hint={`${quiz.attempts_count} passage(s)`} />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                <Badge color={quiz.requires_course_completion ? 'blue' : 'gray'}>{quiz.requires_course_completion ? 'Cours terminés exigés' : 'Accès sans terminer les cours'}</Badge>
                <Badge color={quiz.shuffle_questions ? 'blue' : 'gray'}>{quiz.shuffle_questions ? 'Questions mélangées' : 'Questions dans l\'ordre'}</Badge>
                <Badge color={quiz.shuffle_answers ? 'blue' : 'gray'}>{quiz.shuffle_answers ? 'Réponses mélangées' : 'Réponses dans l\'ordre'}</Badge>
            </div>

            <Alert className="mb-4">{actionError}</Alert>

            {quiz.questions.length === 0 ? (
                <EmptyState title="Aucune question" description="Ajoutez les questions et leurs réponses." action={<Button onClick={() => setModal({ type: 'question' })}>Ajouter une question</Button>} />
            ) : (
                <div className="flex flex-col gap-4">
                    {quiz.questions.map((question, index) => (
                        <Card key={question.id}>
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900">
                                        <span className="text-blue-900">Q{index + 1}.</span> {question.text}
                                    </p>
                                    <div className="mt-1 flex gap-2">
                                        <Badge color={question.type === 'multiple' ? 'purple' : 'gray'}>{questionTypeLabels[question.type]}</Badge>
                                        <Badge>{question.points} pt(s)</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'question', question })}>
                                        Modifier
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => removeQuestion(question)}>
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {question.answers.map((answer) => (
                                    <li
                                        key={answer.id}
                                        className={`rounded-lg px-3 py-2 text-sm ${answer.is_correct ? 'bg-emerald-50 font-medium text-emerald-800 ring-1 ring-emerald-300' : 'bg-slate-50 text-slate-600'}`}
                                    >
                                        {answer.is_correct ? '✓ ' : ''}
                                        {answer.text}
                                    </li>
                                ))}
                            </ul>
                            {question.explanation && <p className="mt-3 text-xs text-slate-500 italic">Explication : {question.explanation}</p>}
                        </Card>
                    ))}
                </div>
            )}

            {modal?.type === 'quiz' && <QuizFormModal quiz={quiz} onClose={() => setModal(null)} onSaved={closeAndReload} />}
            {modal?.type === 'question' && (
                <QuestionFormModal quizId={quiz.id} question={modal.question} nextPosition={nextPosition} onClose={() => setModal(null)} onSaved={closeAndReload} />
            )}
        </>
    );
}
