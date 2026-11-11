import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage, validationErrors } from '../../lib/api';
import { Alert, Button, Input } from '../../components/ui';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        setStatus(null);

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setStatus({ type: 'success', message: data.message });
        } catch (error) {
            setErrors(validationErrors(error));
            if (error.response?.status !== 422) {
                setStatus({ type: 'error', message: errorMessage(error) });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mot de passe oublié</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Saisissez votre e-mail : nous vous enverrons un lien de réinitialisation.</p>
            </div>
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <Input label="Adresse e-mail" type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} required />
            <Button type="submit" loading={submitting} className="w-full">
                Envoyer le lien
            </Button>
            <Link to="/login" className="text-center text-sm font-medium text-blue-900 dark:text-blue-300 hover:underline">
                ← Retour à la connexion
            </Link>
        </form>
    );
}
