import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FormationCover from '../../components/FormationCover';
import Icon from '../../components/Icon';
import { Alert, Badge, Button, Card, Loading, PageHeader, ProgressBar } from '../../components/ui';
import api, { errorMessage } from '../../lib/api';
import { levelLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

/**
 * Quiz du module : accessible une fois tous les cours du module terminés (EF-11).
 */
function ModuleQuiz({ quiz, module, isEnrolled }) {
    const coursesDone = module.courses.every((course) => course.is_completed);

    return (
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-5 py-3">
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${quiz.is_passed ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300'}`}>
                <Icon name={quiz.is_passed ? 'check' : 'quiz'} className="size-4" />
            </span>
            <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{quiz.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {quiz.questions_count} questions · score requis {quiz.passing_score}/100
                    {quiz.time_limit_minutes && ` · ${quiz.time_limit_minutes} min`}
                </p>
                {isEnrolled && !quiz.is_passed && quiz.requires_course_completion && !coursesDone && (
                    <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">Accessible une fois les cours du module terminés.</p>
                )}
            </div>
            {quiz.is_passed && <Badge color="green">Module validé</Badge>}
            {isEnrolled && (
                <Button size="sm" variant={quiz.is_passed ? 'secondary' : 'primary'} to={`/quizzes/${quiz.id}`}>
                    {quiz.is_passed ? 'Voir mes résultats' : 'Passer le quiz'}
                </Button>
            )}
        </div>
    );
}

export default function FormationShow() {
    const { id } = useParams();
    const { data: formation, loading, error, reload } = useApi(`/formations/${id}`);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState(null);

    if (loading && !formation) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const modulesToValidate = formation.modules.filter((module) => module.quiz && !module.quiz.is_passed).length;

    const enroll = async () => {
        setEnrolling(true);
        setEnrollError(null);

        try {
            await api.post(`/formations/${id}/enroll`);
            await reload();
        } catch (exception) {
            setEnrollError(errorMessage(exception));
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <>
            <PageHeader back={{ to: '/formations', label: 'Toutes les formations' }} title={`Formation ${formation.title}`} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    {formation.modules.map((module) => (
                        <Card key={module.id} className="overflow-hidden p-0">
                            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                                <p className="text-xs font-semibold tracking-wide text-blue-900 dark:text-blue-300 uppercase">Module {module.number}</p>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{module.title}</h2>
                                {module.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{module.description}</p>}
                            </div>
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {module.courses.map((course) => {
                                    const content = (
                                        <>
                                            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${course.is_completed ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                <Icon name={course.is_completed ? 'check' : 'play'} className="size-4" />
                                            </span>
                                            <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{course.title}</span>
                                            {course.duration_minutes && <span className="text-xs text-slate-500 dark:text-slate-400">{course.duration_minutes} min</span>}
                                        </>
                                    );

                                    return (
                                        <li key={course.id}>
                                            {formation.is_enrolled ? (
                                                <Link to={`/courses/${course.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                    {content}
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-3 px-5 py-3 opacity-70">{content}</div>
                                            )}
                                        </li>
                                    );
                                })}
                                {module.courses.length === 0 && <li className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">Aucun cours dans ce module.</li>}
                            </ul>
                            {module.quiz && <ModuleQuiz quiz={module.quiz} module={module} isEnrolled={formation.is_enrolled} />}
                        </Card>
                    ))}

                    {formation.quiz && (
                        <Card className="border-l-4 border-blue-900 dark:border-blue-500">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-blue-900 dark:text-blue-300 uppercase">Évaluation finale</p>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formation.quiz.title}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {formation.quiz.questions_count} questions · score requis {formation.quiz.passing_score}/100
                                        {formation.quiz.time_limit_minutes && ` · ${formation.quiz.time_limit_minutes} min`}
                                    </p>
                                    {formation.is_enrolled && !formation.quiz.is_passed && modulesToValidate > 0 && (
                                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                                            Accessible une fois le quiz de chaque module réussi ({modulesToValidate} restant{modulesToValidate > 1 ? 's' : ''}).
                                        </p>
                                    )}
                                    {formation.is_enrolled && !formation.quiz.is_passed && modulesToValidate === 0 && formation.quiz.requires_course_completion && formation.progress.percent < 100 && (
                                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Accessible une fois tous les cours terminés.</p>
                                    )}
                                    {formation.quiz.is_passed && <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">✓ Formation réussie</p>}
                                </div>
                                {formation.is_enrolled && <Button to={`/quizzes/${formation.quiz.id}`}>Accéder à l'évaluation</Button>}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="order-first lg:order-none">
                    <Card className="sticky top-24 overflow-hidden p-0">
                        <FormationCover formation={formation} className="h-40" />
                        <div className="flex flex-col gap-4 p-5">
                            <div className="flex flex-wrap gap-2">
                                <Badge color="blue">{levelLabels[formation.level]}</Badge>
                                <Badge>{formation.modules_count} modules</Badge>
                                <Badge>{formation.progress.total_courses} cours</Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{formation.description}</p>
                            <Alert>{enrollError}</Alert>
                            {formation.is_enrolled ? (
                                <div>
                                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Votre progression</p>
                                    <ProgressBar percent={formation.progress.percent} />
                                </div>
                            ) : (
                                <Button onClick={enroll} loading={enrolling} className="w-full">
                                    S'inscrire à la formation
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
