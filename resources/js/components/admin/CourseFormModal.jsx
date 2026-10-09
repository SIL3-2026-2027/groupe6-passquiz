import api, { toFormData } from '../../lib/api';
import useForm from '../../lib/useForm';
import { Alert, Button, Checkbox, Input, Modal, Textarea } from '../ui';

export default function CourseFormModal({ moduleId, course, nextPosition = 1, onClose, onSaved }) {
    const form = useForm({
        title: course?.title ?? '',
        description: course?.description ?? '',
        content: course?.content ?? '',
        video_url: course?.video_url ?? '',
        duration_minutes: course?.duration_minutes ?? '',
        position: course?.position ?? nextPosition,
        pdf: null,
        remove_pdf: false,
    });

    const save = () =>
        form.submit(async (values) => {
            const payload = { ...values, pdf: values.pdf ?? undefined };
            const { data } = course
                ? await api.post(`/admin/courses/${course.id}`, toFormData(payload, 'PUT'))
                : await api.post(`/admin/modules/${moduleId}/courses`, toFormData(payload));
            onSaved(data.data);
        });

    return (
        <Modal
            open
            size="xl"
            title={course ? 'Modifier le cours' : 'Nouveau cours'}
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
                    <Input label="Titre" {...form.bind('title')} />
                </div>
                <div className="sm:col-span-2">
                    <Textarea label="Description" rows={2} {...form.bind('description')} />
                </div>
                <div className="sm:col-span-2">
                    <Textarea label="Contenu du cours" rows={10} {...form.bind('content')} />
                </div>
                <div className="sm:col-span-2">
                    <Input label="Vidéo (URL YouTube, Vimeo ou fichier .mp4)" type="url" {...form.bind('video_url')} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
                <Input label="Durée estimée (minutes)" type="number" min={1} {...form.bind('duration_minutes')} />
                <Input label="Ordre du cours dans le module" type="number" min={1} {...form.bind('position')} />
                <div className="sm:col-span-2">
                    <Input
                        label="Document PDF"
                        type="file"
                        name="pdf"
                        accept="application/pdf"
                        error={form.errors.pdf}
                        hint={course?.pdf_url ? 'Un PDF est déjà associé. Choisissez un fichier pour le remplacer.' : '10 Mo maximum'}
                        onChange={(event) => form.setField('pdf', event.target.files[0] ?? null)}
                    />
                </div>
                {course?.pdf_url && (
                    <div className="sm:col-span-2">
                        <Checkbox label="Supprimer le PDF actuel" checked={form.values.remove_pdf} onChange={(value) => form.setField('remove_pdf', value)} />
                    </div>
                )}
            </div>
        </Modal>
    );
}
