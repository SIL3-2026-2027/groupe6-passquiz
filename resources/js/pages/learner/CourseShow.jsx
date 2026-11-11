import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { Alert, Badge, Button, Card, Loading, PageHeader, ProgressBar } from '../../components/ui';
import api, { errorMessage } from '../../lib/api';
import { embedVideoUrl } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function CourseShow() {
    const { id } = useParams();
    const { data: course, loading, error, reload } = useApi(`/courses/${id}`);
    const formationId = course?.module?.formation?.id;
    const { data: formation, reload: reloadFormation } = useApi(formationId ? `/formations/${formationId}` : null);
    const [completing, setCompleting] = useState(false);
    const [actionError, setActionError] = useState(null);

    if (loading && !course) {
        return <Loading />;
    }

    if (error) {
        return (
            <Alert>
                {error} Vous devez être inscrit à la formation pour accéder à ce cours. <Link to="/formations" className="font-semibold underline">Voir les formations</Link>
            </Alert>
        );
    }

    const allCourses = formation?.modules.flatMap((module) => module.courses.map((item) => ({ ...item, moduleNumber: module.number }))) ?? [];
    const index = allCourses.findIndex((item) => item.id === course.id);
    const previous = index > 0 ? allCourses[index - 1] : null;
    const next = index >= 0 && index < allCourses.length - 1 ? allCourses[index + 1] : null;
    const videoEmbed = embedVideoUrl(course.video_url);
    const currentModule = formation?.modules.find((module) => module.courses.some((item) => item.id === course.id));
    const isLastCourseOfModule = currentModule?.courses.at(-1)?.id === course.id;
    // À la fin d'un module, on propose son quiz tant qu'il n'est pas réussi.
    const moduleQuiz = isLastCourseOfModule && currentModule.quiz && !currentModule.quiz.is_passed ? currentModule.quiz : null;

    const complete = async () => {
        setCompleting(true);
        setActionError(null);

        try {
            await api.post(`/courses/${course.id}/complete`);
            await Promise.all([reload(), reloadFormation()]);
        } catch (exception) {
            setActionError(errorMessage(exception));
        } finally {
            setCompleting(false);
        }
    };

    return (
        <>
            <PageHeader
                back={{ to: `/formations/${formationId}`, label: `Formation ${course.module.formation.title}` }}
                title={course.title}
                subtitle={`Module ${course.module.number} : ${course.module.title}`}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {videoEmbed && (
                        <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-sm">
                            <iframe src={videoEmbed} title={course.title} className="size-full" allowFullScreen />
                        </div>
                    )}
                    {course.video_url && !videoEmbed && (
                        <video src={course.video_url} controls className="w-full rounded-xl bg-black shadow-sm" />
                    )}

                    <Card>
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            {course.duration_minutes && (
                                <Badge>
                                    <Icon name="clock" className="mr-1 size-3.5" />
                                    {course.duration_minutes} min
                                </Badge>
                            )}
                            {course.is_completed && <Badge color="green">Cours terminé</Badge>}
                        </div>
                        {course.description && <p className="mb-4 text-slate-600 dark:text-slate-400 italic">{course.description}</p>}
                        {course.content_html ? (
                            // HTML produit par le serveur à partir du Markdown, balises HTML saisies échappées.
                            <div className="course-content" dangerouslySetInnerHTML={{ __html: course.content_html }} />
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400">Aucun contenu pour ce cours.</p>
                        )}
                        {course.pdf_url && (
                            <a href={course.pdf_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                                <Icon name="document" />
                                Télécharger le support PDF
                            </a>
                        )}
                    </Card>

                    <Alert>{actionError}</Alert>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {previous ? (
                            <Button variant="secondary" to={`/courses/${previous.id}`}>
                                ← Cours précédent
                            </Button>
                        ) : (
                            <span />
                        )}
                        <div className="flex gap-2">
                            {!course.is_completed && (
                                <Button variant="success" onClick={complete} loading={completing}>
                                    <Icon name="check" className="size-4" />
                                    Marquer comme terminé
                                </Button>
                            )}
                            {moduleQuiz ? (
                                <Button to={`/quizzes/${moduleQuiz.id}`}>Passer le quiz du module →</Button>
                            ) : next ? (
                                <Button to={`/courses/${next.id}`}>Cours suivant →</Button>
                            ) : (
                                formation?.quiz && <Button to={`/quizzes/${formation.quiz.id}`}>Passer l'évaluation finale →</Button>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <Card className="sticky top-24">
                        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Progression</h2>
                        {formation && <ProgressBar percent={formation.progress.percent} />}
                        <ul className="mt-4 flex max-h-96 flex-col gap-1 overflow-y-auto">
                            {allCourses.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        to={`/courses/${item.id}`}
                                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${item.id === course.id ? 'bg-blue-50 dark:bg-blue-950/50 font-semibold text-blue-900 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <Icon name={item.is_completed ? 'check' : 'play'} className={`size-4 shrink-0 ${item.is_completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                        <span className="truncate">
                                            M{item.moduleNumber} · {item.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </>
    );
}
