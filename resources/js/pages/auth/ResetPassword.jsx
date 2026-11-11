import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { errorMessage, validationErrors } from '../../lib/api';
import { Alert, Button, Input } from '../../components/ui';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [values, setValues] = useState({
        email: searchParams.get('email') ?? '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        setMessage(null);

        try {
            const { data } = await api.post('/auth/reset-password', { ...values, token: searchParams.get('token') });
            navigate('/login', { state: { message: data.message } });
        } catch (error) {
            setErrors(validationErrors(error));
            if (error.response?.status !== 422) {
                setMessage(errorMessage(error));
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nouveau mot de passe</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>
            <Alert>{message}</Alert>
            <Alert>{errors.token}</Alert>
            <Input label="Adresse e-mail" type="email" name="email" value={values.email} onChange={change} error={errors.email} required />
            <Input label="Nouveau mot de passe" type="password" name="password" value={values.password} onChange={change} error={errors.password} required />
            <Input label="Confirmer le mot de passe" type="password" name="password_confirmation" value={values.password_confirmation} onChange={change} required />
            <Button type="submit" loading={submitting} className="w-full">
                Réinitialiser
            </Button>
            <Link to="/login" className="text-center text-sm font-medium text-blue-900 dark:text-blue-300 hover:underline">
                ← Retour à la connexion
            </Link>
        </form>
    );
}
