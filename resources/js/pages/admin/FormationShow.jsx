import { useState } from 'react';
import { useParams } from 'react-router-dom';
import CourseFormModal from '../../components/admin/CourseFormModal';
import FormationFormModal from '../../components/admin/FormationFormModal';
import ModuleFormModal from '../../components/admin/ModuleFormModal';
import QuizFormModal from '../../components/admin/QuizFormModal';
import Icon from '../../components/Icon';
import { Alert, Badge, Button, Card, EmptyState, FormationStatusBadge, Loading, PageHeader, Pagination, ProgressBar, Table, Td } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api, { errorMessage } from '../../lib/api';
import { formatDate, levelLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

function Learners({ formationId }) {
    const [page, setPage] = useState(1);
    const { data, meta, loading, error } = useApi(`/admin/formations/${formationId}/learners`, { page });

    if (loading && !data) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    if (data.length === 0) {
        return <EmptyState title="Aucun apprenant inscrit à cette formation" />;
    }

    const totalCourses = meta.total_courses;

    return (
        <>
            <Table headers={['Apprenant', 'Inscrit le', 'Cours terminés', 'Progression', '']}>
                {data.map((learner) => (
                    <tr key={learner.id}>
                        <Td>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{learner.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{learner.email}</p>
                        </Td>
                        <Td>{formatDate(learner.enrollment.enrolled_at)}</Td>
                        <Td>
                            {learner.completed_courses_count}/{totalCourses}
                        </Td>
                        <Td className="min-w-48">
                            <ProgressBar percent={totalCourses ? Math.round((learner.completed_courses_count / totalCourses) * 100) : 0} size="sm" />
                        </Td>
                        <Td className="text-right">
                            <Button variant="ghost" size="sm" to={`/admin/users/${learner.id}`}>
                                Détails
                            </Button>
                        </Td>
                    </tr>
                ))}
            </Table>
            <Pagination meta={meta} onPageChange={setPage} />
        </>
    );
}

export default function FormationShow() {
    const { isAdmin } = useAuth();
    const { id } = useParams();
    const { data: formation, loading, error, reload } = useApi(`/admin/formations/${id}`);
    const [tab, setTab] = useState('content');
    const [modal, setModal] = useState(null);
    const [actionError, setActionError] = useState(null);

    if (loading && !formation) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const closeAndReload = () => {
        setModal(null);
        reload();
    };

    const remove = async (url, message) => {
        if (!window.confirm(message)) {
            return;
        }

        try {
            setActionError(null);
            await api.delete(url);
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    const togglePublication = async () => {
        try {
            setActionError(null);
            await api.put(`/admin/formations/${formation.id}/publication`, { is_published: !formation.is_published });
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    const nextModuleNumber = Math.max(0, ...formation.modules.map((module) => module.number)) + 1;
    const tabClass = (name) => `border-b-2 px-4 py-2 text-sm font-semibold ${tab === name ? 'border-blue-900 dark:border-blue-500 text-blue-900 dark:text-blue-300' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`;

    return (
        <>
            <PageHeader
                back={{ to: '/admin/formations', label: isAdmin ? 'Formations' : 'Mes formations' }}
                title={`Formation ${formation.title}`}
                subtitle={formation.description}
                actions={
                    <>
                        <Button variant="secondary" onClick={() => setModal({ type: 'formation' })}>
                            Modifier la formation
                        </Button>
                        {isAdmin && (
                            <Button variant={formation.is_published ? 'secondary' : 'success'} onClick={togglePublication}>
                                {formation.is_published ? 'Retirer la publication' : 'Valider et publier'}
                            </Button>
                        )}
                    </>
                }
            />

            {!formation.is_published && !isAdmin && (
                <Alert type="warning" className="mb-4">
                    Cette formation n'est pas encore visible des apprenants : elle attend la validation d'un administrateur.
                </Alert>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
                <FormationStatusBadge formation={formation} />
                {isAdmin && <Badge color="purple">{formation.trainer ? `Formateur : ${formation.trainer.name}` : 'Sans formateur'}</Badge>}
                <Badge color="blue">{levelLabels[formation.level]}</Badge>
                <Badge>Code {formation.code}</Badge>
                <Badge>{formation.modules_count} modules</Badge>
                <Badge>{formation.courses_count} cours</Badge>
                <Badge>{formation.enrollments_count} inscrits</Badge>
            </div>

            <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
                <button type="button" className={tabClass('content')} onClick={() => setTab('content')}>
                    Modules & cours
                </button>
                <button type="button" className={tabClass('learners')} onClick={() => setTab('learners')}>
                    Apprenants ({formation.enrollments_count})
                </button>
            </div>

            <Alert className="mb-4">{actionError}</Alert>

            {tab === 'learners' ? (
                <Learners formationId={formation.id} />
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setModal({ type: 'module' })}>+ Ajouter un module</Button>
                    </div>

                    {formation.modules.length === 0 && <EmptyState title="Aucun module" description="Commencez par ajouter le module 1." />}

                    {formation.modules.map((module) => (
                        <Card key={module.id} className="overflow-hidden p-0">
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-blue-900 dark:text-blue-300 uppercase">Module {module.number}</p>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{module.title}</h2>
                                    {module.description && <p className="text-sm text-slate-500 dark:text-slate-400">{module.description}</p>}
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setModal({ type: 'course', moduleId: module.id, nextPosition: Math.max(0, ...module.courses.map((course) => course.position)) + 1 })}
                                    >
                                        + Cours
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'module', module })}>
                                        Modifier
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 dark:text-red-400"
                                        onClick={() => remove(`/admin/modules/${module.id}`, `Supprimer le module ${module.number} et tous ses cours ?`)}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {module.courses.map((course) => (
                                    <li key={course.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">{course.position}</span>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{course.title}</p>
                                            <p className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                {course.duration_minutes && <span>{course.duration_minutes} min</span>}
                                                {course.video_url && <span>▶ Vidéo</span>}
                                                {course.pdf_url && (
                                                    <a href={course.pdf_url} target="_blank" rel="noreferrer" className="text-blue-900 dark:text-blue-300 hover:underline">
                                                        📄 PDF
                                                    </a>
                                                )}
                                            </p>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'course', moduleId: module.id, course })}>
                                            Modifier
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => remove(`/admin/courses/${course.id}`, `Supprimer le cours « ${course.title} » ?`)}>
                                            Supprimer
                                        </Button>
                                    </li>
                                ))}
                                {module.courses.length === 0 && <li className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">Aucun cours dans ce module.</li>}
                            </ul>
                            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-5 py-3">
                                <Icon name="quiz" className="size-6 text-blue-900 dark:text-blue-300" />
                                {module.quiz ? (
                                    <>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{module.quiz.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {module.quiz.questions_count} questions · score requis {module.quiz.passing_score}/100
                                                {module.quiz.time_limit_minutes && ` · ${module.quiz.time_limit_minutes} min`}
                                            </p>
                                        </div>
                                        {!module.quiz.is_published && <Badge color="amber">Brouillon</Badge>}
                                        <Button size="sm" variant="secondary" to={`/admin/quizzes/${module.quiz.id}`}>
                                            Gérer les questions
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="flex-1 text-sm text-slate-600 dark:text-slate-400">Ce module n'a pas encore de quiz.</p>
                                        <Button size="sm" onClick={() => setModal({ type: 'quiz', module })}>
                                            Créer le quiz du module
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Card>
                    ))}

                    <Card className="border-l-4 border-blue-900 dark:border-blue-500">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Icon name="quiz" className="size-8 text-blue-900 dark:text-blue-300" />
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-blue-900 dark:text-blue-300 uppercase">Évaluation finale</p>
                                    {formation.quiz ? (
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {formation.quiz.title} · {formation.quiz.questions_count} questions · score requis {formation.quiz.passing_score}/100
                                        </p>
                                    ) : (
                                        <p className="text-slate-600 dark:text-slate-400">Cette formation n'a pas encore d'évaluation.</p>
                                    )}
                                </div>
                            </div>
                            {formation.quiz ? (
                                <Button to={`/admin/quizzes/${formation.quiz.id}`}>Gérer les questions</Button>
                            ) : (
                                <Button onClick={() => setModal({ type: 'quiz' })}>Créer l'évaluation</Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {modal?.type === 'formation' && <FormationFormModal formation={formation} onClose={() => setModal(null)} onSaved={closeAndReload} />}
            {modal?.type === 'module' && (
                <ModuleFormModal formationId={formation.id} module={modal.module} nextNumber={nextModuleNumber} onClose={() => setModal(null)} onSaved={closeAndReload} />
            )}
            {modal?.type === 'course' && (
                <CourseFormModal moduleId={modal.moduleId} course={modal.course} nextPosition={modal.nextPosition} onClose={() => setModal(null)} onSaved={closeAndReload} />
            )}
            {modal?.type === 'quiz' && <QuizFormModal formationId={formation.id} module={modal.module} onClose={() => setModal(null)} onSaved={closeAndReload} />}
        </>
    );
}
