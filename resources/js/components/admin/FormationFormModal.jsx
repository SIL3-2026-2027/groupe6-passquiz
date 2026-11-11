import { useAuth } from '../../context/AuthContext';
import api, { toFormData } from '../../lib/api';
import useApi from '../../lib/useApi';
import useForm from '../../lib/useForm';
import { Alert, Button, Checkbox, Input, Modal, Select, Textarea } from '../ui';

export const levelOptions = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' },
];

export default function FormationFormModal({ formation, onClose, onSaved }) {
    const { isAdmin } = useAuth();
    const { data: trainers } = useApi(isAdmin ? '/admin/users' : null, { role: 'trainer', per_page: 100 });
    const form = useForm({
        trainer_id: formation?.trainer_id ?? '',
        title: formation?.title ?? '',
        code: formation?.code ?? '',
        slug: formation?.slug ?? '',
        description: formation?.description ?? '',
        level: formation?.level ?? 'beginner',
        is_published: formation?.is_published ?? false,
        image: null,
        remove_image: false,
    });

    const save = () =>
        form.submit(async (values) => {
            const payload = isAdmin
                ? { ...values, image: values.image ?? undefined }
                : { ...values, image: values.image ?? undefined, is_published: undefined, trainer_id: undefined };
            const { data } = formation
                ? await api.post(`/admin/formations/${formation.id}`, toFormData(payload, 'PUT'))
                : await api.post('/admin/formations', toFormData(payload));
            onSaved(data.data);
        });

    return (
        <Modal
            open
            title={formation ? `Modifier la formation ${formation.title}` : 'Nouvelle formation'}
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
                    <Input label="Titre" {...form.bind('title')} placeholder="Ex : Laravel" />
                </div>
                <Input label="Code" {...form.bind('code')} hint="Utilisé dans le n° de certificat (ex : LAR). Généré si vide." maxLength={10} />
                <Input label="Slug (URL)" {...form.bind('slug')} hint="Généré depuis le titre si vide." />
                <div className="sm:col-span-2">
                    <Textarea label="Description" {...form.bind('description')} />
                </div>
                <Select label="Niveau" {...form.bind('level')} options={levelOptions} />
                {isAdmin && (
                    <Select
                        label="Formateur responsable"
                        {...form.bind('trainer_id')}
                        placeholder="Aucun formateur"
                        options={(trainers ?? []).map((trainer) => ({ value: trainer.id, label: trainer.name }))}
                    />
                )}
                <Input
                    label="Image"
                    type="file"
                    name="image"
                    accept="image/*"
                    error={form.errors.image}
                    onChange={(event) => form.setField('image', event.target.files[0] ?? null)}
                />
                <div className="flex flex-col gap-2 sm:col-span-2">
                    {isAdmin ? (
                        <Checkbox label="Publiée (visible par les apprenants)" checked={form.values.is_published} onChange={(value) => form.setField('is_published', value)} />
                    ) : (
                        <Alert type="info">
                            {formation?.is_published
                                ? 'Cette formation est publiée : vos modifications sont visibles des apprenants.'
                                : 'La formation restera en attente jusqu’à sa validation et sa publication par un administrateur.'}
                        </Alert>
                    )}
                    {formation?.image_url && (
                        <Checkbox label="Supprimer l'image actuelle" checked={form.values.remove_image} onChange={(value) => form.setField('remove_image', value)} />
                    )}
                </div>
            </div>
        </Modal>
    );
}
