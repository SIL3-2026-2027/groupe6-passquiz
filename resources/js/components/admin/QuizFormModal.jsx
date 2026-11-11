import api from '../../lib/api';
import useForm from '../../lib/useForm';
import useApi from '../../lib/useApi';
import { Alert, Button, Checkbox, Input, Modal, Select, Textarea } from '../ui';

/**
 * Valeurs par défaut du cahier des charges : 60 % pour un quiz de module, 70 % pour l'évaluation finale (§6.2),
 * 3 tentatives et 24 h d'attente après un échec (EF-16).
 */
function defaultsFor(module) {
    return module
        ? { title: `Quiz — Module ${module.number} : ${module.title}`, passing_score: 60 }
        : { title: 'Évaluation finale', passing_score: 70 };
}

export default function QuizFormModal({ quiz, formationId, module, onClose, onSaved }) {
    const { data: formations } = useApi('/admin/formations', { per_page: 100 });
    const form = useForm({
        formation_id: quiz?.formation_id ?? formationId ?? '',
        module_id: quiz?.module_id ?? module?.id ?? '',
        title: quiz?.title ?? defaultsFor(module).title,
        description: quiz?.description ?? '',
        passing_score: quiz?.passing_score ?? defaultsFor(module).passing_score,
        time_limit_minutes: quiz?.time_limit_minutes ?? '',
        max_attempts: quiz?.max_attempts ?? 3,
        retry_delay_minutes: quiz?.retry_delay_minutes ?? 1440,
        requires_course_completion: quiz?.requires_course_completion ?? true,
        shuffle_questions: quiz?.shuffle_questions ?? true,
        shuffle_answers: quiz?.shuffle_answers ?? true,
        is_published: quiz?.is_published ?? false,
    });

    const { data: selectedFormation } = useApi(form.values.formation_id ? `/admin/formations/${form.values.formation_id}` : null);
    const formationOptions = (formations ?? []).map((formation) => ({ value: formation.id, label: formation.title }));

    // Un module n'a qu'un quiz et la formation qu'une évaluation finale : on ne propose que les emplacements libres.
    const typeOptions = selectedFormation
        ? [
              ...(!selectedFormation.quiz || selectedFormation.quiz.id === quiz?.id ? [{ value: '', label: 'Évaluation finale de la formation' }] : []),
              ...selectedFormation.modules
                  .filter((item) => !item.quiz || item.quiz.id === quiz?.id)
                  .map((item) => ({ value: item.id, label: `Quiz du module ${item.number} : ${item.title}` })),
          ]
        : [];

    const changeType = (moduleId) => {
        const selectedModule = selectedFormation?.modules.find((item) => item.id === Number(moduleId));

        form.setValues((values) => ({ ...values, module_id: moduleId, ...(quiz ? {} : defaultsFor(selectedModule)) }));
    };

    const save = () =>
        form.submit(async (values) => {
            const { data } = quiz ? await api.put(`/admin/quizzes/${quiz.id}`, values) : await api.post('/admin/quizzes', values);
            onSaved(data.data);
        });

    return (
        <Modal
            open
            title={quiz ? 'Modifier le quiz' : 'Nouveau quiz'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={save} loading={form.submitting}>
                        Enregistrer
                    </Button>
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                {form.message && Object.keys(form.errors).length === 0 && <Alert className="sm:col-span-2">{form.message}</Alert>}
                <div className="sm:col-span-2">
                    <Select
                        label="Formation"
                        {...form.bind('formation_id')}
                        onChange={(event) => form.setValues((values) => ({ ...values, formation_id: event.target.value, module_id: '' }))}
                        options={formationOptions}
                        placeholder="Choisir une formation"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Select
                        label="Type de quiz"
                        {...form.bind('module_id')}
                        onChange={(event) => changeType(event.target.value)}
                        options={typeOptions}
                        hint="Un quiz par module (accessible quand ses cours sont terminés) et une évaluation finale (accessible quand tous les modules sont validés)."
                    />
                </div>
                <div className="sm:col-span-2">
                    <Input label="Titre" {...form.bind('title')} />
                </div>
                <div className="sm:col-span-2">
                    <Textarea label="Description" rows={3} {...form.bind('description')} />
                </div>
                <Input label="Score minimum pour réussir (/100)" type="number" min={1} max={100} {...form.bind('passing_score')} />
                <Input label="Durée limite (minutes)" type="number" min={1} {...form.bind('time_limit_minutes')} hint="Vide = pas de limite" />
                <Input label="Nombre maximal de tentatives" type="number" min={1} {...form.bind('max_attempts')} hint="Vide = illimité" />
                <Input label="Délai avant de recommencer (minutes)" type="number" min={1} {...form.bind('retry_delay_minutes')} hint="Après un échec. Vide = immédiat" />
                <div className="flex flex-col gap-3 sm:col-span-2">
                    <Checkbox
                        label="Exiger que les cours soient terminés avant le quiz (ceux du module, ou toute la formation pour l'évaluation finale)"
                        checked={form.values.requires_course_completion}
                        onChange={(value) => form.setField('requires_course_completion', value)}
                    />
                    <Checkbox label="Mélanger l'ordre des questions à chaque tentative" checked={form.values.shuffle_questions} onChange={(value) => form.setField('shuffle_questions', value)} />
                    <Checkbox label="Mélanger l'ordre des réponses" checked={form.values.shuffle_answers} onChange={(value) => form.setField('shuffle_answers', value)} />
                    <Checkbox label="Publiée (accessible aux apprenants)" checked={form.values.is_published} onChange={(value) => form.setField('is_published', value)} />
                </div>
            </div>
        </Modal>
    );
}
