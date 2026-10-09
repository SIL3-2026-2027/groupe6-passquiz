import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage, validationErrors } from '../lib/api';
import { roleColors, roleLabels } from '../lib/format';
import { Alert, Badge, Button, Card, Input, PageHeader } from '../components/ui';

function ProfileForm() {
    const { user, setUser } = useAuth();
    const [values, setValues] = useState({ name: user.name, email: user.email });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        setStatus(null);

        try {
            const { data } = await api.put('/profile', values);
            setUser(data.data);
            setStatus({ type: 'success', message: 'Profil mis à jour.' });
        } catch (error) {
            setErrors(validationErrors(error));
            setStatus({ type: 'error', message: errorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Informations du profil</h2>
                {status && <Alert type={status.type}>{status.message}</Alert>}
                <Input label="Nom complet" name="name" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} error={errors.name} required />
                <Input label="Adresse e-mail" type="email" name="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} error={errors.email} required />
                <div>
                    <Button type="submit" loading={submitting}>
                        Enregistrer
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function PasswordForm() {
    const emptyValues = { current_password: '', password: '', password_confirmation: '' };
    const [values, setValues] = useState(emptyValues);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        setStatus(null);

        try {
            const { data } = await api.put('/profile/password', values);
            setValues(emptyValues);
            setStatus({ type: 'success', message: data.message });
        } catch (error) {
            setErrors(validationErrors(error));
            setStatus({ type: 'error', message: errorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Changer le mot de passe</h2>
                {status && <Alert type={status.type}>{status.message}</Alert>}
                <Input label="Mot de passe actuel" type="password" name="current_password" value={values.current_password} onChange={change} error={errors.current_password} required />
                <Input label="Nouveau mot de passe" type="password" name="password" value={values.password} onChange={change} error={errors.password} required />
                <Input label="Confirmer le nouveau mot de passe" type="password" name="password_confirmation" value={values.password_confirmation} onChange={change} required />
                <div>
                    <Button type="submit" loading={submitting}>
                        Modifier le mot de passe
                    </Button>
                </div>
            </form>
        </Card>
    );
}

export default function Profile() {
    const { user } = useAuth();

    return (
        <>
            <PageHeader title="Mon profil" subtitle={<>Connecté en tant que <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge></>} />
            <div className="grid gap-6 lg:grid-cols-2">
                <ProfileForm />
                <PasswordForm />
            </div>
        </>
    );
}
