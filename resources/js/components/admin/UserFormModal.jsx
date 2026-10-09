import api from '../../lib/api';
import useForm from '../../lib/useForm';
import { Alert, Button, Checkbox, Input, Modal, Select } from '../ui';

export default function UserFormModal({ user, onClose, onSaved }) {
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        role: user?.role ?? 'learner',
        is_active: user?.is_active ?? true,
    });

    const save = () =>
        form.submit(async (values) => {
            const { data } = user ? await api.put(`/admin/users/${user.id}`, values) : await api.post('/admin/users', values);
            onSaved(data.data);
        });

    return (
        <Modal
            open
            title={user ? `Modifier ${user.name}` : 'Nouvel utilisateur'}
            onClose={onClose}
            size="md"
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
                <Input label="Nom complet" {...form.bind('name')} />
                <Input label="Adresse e-mail" type="email" {...form.bind('email')} />
                <Input label="Mot de passe" type="password" {...form.bind('password')} hint={user ? 'Laisser vide pour ne pas le changer' : '8 caractères minimum'} />
                <Select
                    label="Rôle"
                    {...form.bind('role')}
                    options={[
                        { value: 'learner', label: 'Apprenant' },
                        { value: 'trainer', label: 'Formateur (gère formations, cours et évaluations)' },
                        { value: 'admin', label: 'Administrateur' },
                    ]}
                />
                <Checkbox label="Compte actif" checked={form.values.is_active} onChange={(value) => form.setField('is_active', value)} />
            </div>
        </Modal>
    );
}
