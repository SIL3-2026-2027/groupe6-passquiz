import api from '../../lib/api';
import useForm from '../../lib/useForm';
import { Alert, Button, Input, Modal, Textarea } from '../ui';

export default function ModuleFormModal({ formationId, module, nextNumber = 1, onClose, onSaved }) {
    const form = useForm({
        number: module?.number ?? nextNumber,
        title: module?.title ?? '',
        description: module?.description ?? '',
    });

    const save = () =>
        form.submit(async (values) => {
            const { data } = module ? await api.put(`/admin/modules/${module.id}`, values) : await api.post(`/admin/formations/${formationId}/modules`, values);
            onSaved(data.data);
        });

    return (
        <Modal
            open
            size="md"
            title={module ? 'Modifier le module' : 'Nouveau module'}
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
            <div className="flex flex-col gap-4">
                {form.message && Object.keys(form.errors).length === 0 && <Alert>{form.message}</Alert>}
                <Input label="Numéro du module" type="number" min={1} {...form.bind('number')} />
                <Input label="Titre" {...form.bind('title')} placeholder="Ex : Introduction à Laravel" />
                <Textarea label="Description" rows={3} {...form.bind('description')} />
            </div>
        </Modal>
    );
}
