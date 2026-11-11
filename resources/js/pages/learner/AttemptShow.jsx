import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import RichText from '../../components/RichText';
import { Alert, Badge, Button, Card, Loading } from '../../components/ui';
import api, { downloadFile, errorMessage } from '../../lib/api';
import { questionTypeLabels } from '../../lib/format';

function useCountdown(deadline, onExpire) {
    const [remaining, setRemaining] = useState(null);
    const expiredRef = useRef(false);

    useEffect(() => {
        if (!deadline) {
            return undefined;
        }

        const tick = () => {
            const seconds = Math.max(0, Math.round((new Date(deadline) - Date.now()) / 1000));
            setRemaining(seconds);

            if (seconds === 0 && !expiredRef.current) {
                expiredRef.current = true;
                onExpire();
            }
        };

        tick();
        const interval = setInterval(tick, 1000);

        return () => clearInterval(interval);
    }, [deadline, onExpire]);

    return remaining;
}

function QuizTaking({ attempt, questions, deadline, onSubmitted }) {
    const [selected, setSelected] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const selectedRef = useRef(selected);
    selectedRef.current = selected;

    const submit = useCallback(async () => {
        setSubmitting(true);
        setError(null);

        try {
            const answers = questions.map((question) => ({ question_id: question.id, answer_ids: selectedRef.current[question.id] ?? [] }));
            const { data } = await api.post(`/attempts/${attempt.id}/submit`, { answers });
            onSubmitted(data.data);
        } catch (exception) {
            setError(errorMessage(exception));
            setSubmitting(false);
        }
    }, [attempt.id, questions, onSubmitted]);

    const remaining = useCountdown(deadline, submit);

    const toggle = (question, answerId) => {
        const current = selected[question.id] ?? [];

        const next =
            question.type !== 'multiple' ? [answerId] : current.includes(answerId) ? current.filter((id) => id !== answerId) : [...current, answerId];

        setSelected({ ...selected, [question.id]: next });
    };

    const answeredCount = questions.filter((question) => (selected[question.id] ?? []).length > 0).length;

    const confirmSubmit = () => {
        const unanswered = questions.length - answeredCount;

        if (unanswered > 0 && !window.confirm(`Il reste ${unanswered} question(s) sans réponse. Soumettre quand même ?`)) {
            return;
        }

        submit();
    };

    const minutes = remaining !== null ? String(Math.floor(remaining / 60)).padStart(2, '0') : null;
    const seconds = remaining !== null ? String(remaining % 60).padStart(2, '0') : null;

    return (
        <>
            <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/95 px-4 py-3 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{attempt.quiz.formation.title} · Tentative n° {attempt.attempt_number}</p>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{attempt.quiz.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {answeredCount}/{questions.length} répondues
                        </span>
                        {remaining !== null && (
                            <span className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${remaining < 60 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300'}`}>
                                <Icon name="clock" className="size-4" />
                                {minutes}:{seconds}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {questions.map((question, index) => (
                    <Card key={question.id}>
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0 font-semibold text-slate-900 dark:text-slate-100">
                                <span className="text-blue-900 dark:text-blue-300">Question {index + 1}.</span> <RichText text={question.text} />
                            </div>
                            <Badge color={question.type === 'multiple' ? 'purple' : 'gray'}>{questionTypeLabels[question.type]}</Badge>
                        </div>
                        <div className="flex flex-col gap-2">
                            {question.answers.map((answer) => {
                                const checked = (selected[question.id] ?? []).includes(answer.id);

                                return (
                                    <label
                                        key={answer.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm ring-1 transition ${checked ? 'bg-blue-50 dark:bg-blue-950/50 ring-blue-900 dark:ring-blue-500' : 'ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <input
                                            type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                                            name={`question-${question.id}`}
                                            checked={checked}
                                            onChange={() => toggle(question, answer.id)}
                                            className="size-4 text-blue-900 dark:text-blue-300 focus:ring-blue-900 dark:focus:ring-blue-500"
                                        />
                                        <span>
                                            <RichText text={answer.text} />
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>

            <Alert className="mt-4">{error}</Alert>

            <div className="mt-6 flex justify-end">
                <Button size="lg" onClick={confirmSubmit} loading={submitting}>
                    Soumettre mes réponses
                </Button>
            </div>
        </>
    );
}

function AttemptResult({ attempt }) {
    const passed = attempt.passed;

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <Link to={`/quizzes/${attempt.quiz.id}`} className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-300">
                ← Retour à l'évaluation
            </Link>

            <Card className={`text-center ring-2 ${passed ? 'ring-emerald-300 dark:ring-emerald-700' : 'ring-amber-300 dark:ring-amber-700'}`}>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {attempt.quiz.formation.title} · Tentative n° {attempt.attempt_number}
                </p>
                <p className={`mt-4 text-6xl font-black ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {attempt.score}
                    <span className="text-2xl text-slate-400 dark:text-slate-500">/100</span>
                </p>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Score requis : {attempt.passing_score}/100</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {attempt.earned_points} point(s) sur {attempt.total_points}
                </p>
                <p className={`mt-4 text-xl font-bold ${passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {passed ? '✓ Formation réussie' : '✗ À reprendre'}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {passed && attempt.certificate && (
                        <Button variant="success" onClick={() => downloadFile(attempt.certificate.download_url, `certificat-${attempt.certificate.number}.pdf`)}>
                            <Icon name="award" />
                            Télécharger mon certificat
                        </Button>
                    )}
                    {!passed && <Button to={`/quizzes/${attempt.quiz.id}`}>Refaire l'évaluation</Button>}
                    {!passed && (
                        <Button variant="secondary" to={`/formations/${attempt.quiz.formation.id}`}>
                            Revoir les cours
                        </Button>
                    )}
                </div>
            </Card>

            {attempt.answers?.length > 0 && (
                <Card>
                    <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Détail par question</h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {attempt.answers.map((answer, index) => (
                            <li key={answer.question_id} className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm ${answer.is_correct ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300'}`}>
                                <span>Question {index + 1}</span>
                                <span className="font-semibold">{answer.is_correct ? `✓ +${answer.points_earned} pt` : '✗ 0 pt'}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
}

export default function AttemptShow() {
    const { id } = useParams();
    const [state, setState] = useState({ loading: true, error: null, attempt: null, meta: null });

    useEffect(() => {
        api.get(`/attempts/${id}`)
            .then(({ data }) => setState({ loading: false, error: null, attempt: data.data, meta: data.meta ?? null }))
            .catch((error) => setState({ loading: false, error: errorMessage(error), attempt: null, meta: null }));
    }, [id]);

    const showResult = useCallback((attempt) => {
        setState({ loading: false, error: null, attempt, meta: null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (state.loading) {
        return <Loading />;
    }

    if (state.error) {
        return <Alert>{state.error}</Alert>;
    }

    if (state.attempt.status === 'in_progress') {
        return <QuizTaking attempt={state.attempt} questions={state.meta.questions} deadline={state.meta.deadline} onSubmitted={showResult} />;
    }

    return <AttemptResult attempt={state.attempt} />;
}
