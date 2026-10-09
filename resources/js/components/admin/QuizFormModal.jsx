import api from '../../lib/api';
import useForm from '../../lib/useForm';
import useApi from '../../lib/useApi';
import { Alert, Button, Checkbox, Input, Modal, Select, Textarea } from '../ui';

export default function QuizFormModal({ quiz, formationId, onClose, onSaved }) {
    const { data: formations } = useApi('/admin/formations', { per_page: 100 });
    const form = useForm({
        formation_id: quiz?.formation_id ?? formationId ?? '',
        title: quiz?.title ?? 'Évaluation finale',
        description: quiz?.description ?? '',
        passing_score: quiz?.passing_score ?? 70,
        time_limit_minutes: quiz?.time_limit_minutes ?? '',
        max_attempts: quiz?.max_attempts ?? '',
        retry_delay_minutes: quiz?.retry_delay_minutes ?? '',
        requires_course_completion: quiz?.requires_course_completion ?? true,
        shuffle_questions: quiz?.shuffle_questions ?? true,
        shuffle_answers: quiz?.shuffle_answers ?? true,
        is_published: quiz?.is_published ?? false,
    });

    const formationOptions = (formations ?? [])
        .filter((formation) => !formation.quiz || formation.id === Number(form.values.formation_id))
        .map((formation) => ({ value: formation.id, label: formation.title }));

    const save = () =>
        form.submit(async (values) => {
            const { data } = quiz ? await api.put(`/admin/quizzes/${quiz.id}`, values) : await api.post('/admin/quizzes', values);
            onSaved(data.data);
        });

    return (
        <Modal
            open
            title={quiz ? "Modifier l'évaluation" : 'Nouvelle évaluation'}
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
                    <Select label="Formation" {...form.bind('formation_id')} options={formationOptions} placeholder="Choisir une formation" hint="Une seule évaluation par formation." />
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
                        label="Exiger que tous les cours soient terminés avant l'évaluation"
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
