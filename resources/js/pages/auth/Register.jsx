import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, validationErrors } from '../../lib/api';
import { Alert, Button, Input } from '../../components/ui';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [values, setValues] = useState({ name: '', email: '', password: '', password_confirmation: '' });
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
            await register(values);
            navigate('/formations', { replace: true });
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
                <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
                <p className="mt-1 text-sm text-slate-500">Commencez votre apprentissage dès aujourd'hui.</p>
            </div>
            <Alert>{message}</Alert>
            <Input label="Nom complet" name="name" value={values.name} onChange={change} error={errors.name} autoComplete="name" required />
            <Input label="Adresse e-mail" type="email" name="email" value={values.email} onChange={change} error={errors.email} autoComplete="email" required />
            <Input label="Mot de passe" type="password" name="password" value={values.password} onChange={change} error={errors.password} hint="8 caractères minimum" autoComplete="new-password" required />
            <Input label="Confirmer le mot de passe" type="password" name="password_confirmation" value={values.password_confirmation} onChange={change} autoComplete="new-password" required />
            <Button type="submit" loading={submitting} className="w-full">
                S'inscrire
            </Button>
            <p className="text-center text-sm text-slate-600">
                Déjà inscrit ?{' '}
                <Link to="/login" className="font-semibold text-blue-900 hover:underline">
                    Se connecter
                </Link>
            </p>
        </form>
    );
}
