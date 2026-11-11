import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, validationErrors } from '../../lib/api';
import { homePath } from '../../lib/format';
import { Alert, Button, Input } from '../../components/ui';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [values, setValues] = useState({ email: '', password: '' });
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
            const user = await login(values);
            navigate(location.state?.from ?? homePath(user), { replace: true });
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Connexion</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Heureux de vous revoir sur PassQuiz.</p>
            </div>
            <Alert>{message}</Alert>
            {location.state?.message && <Alert type="success">{location.state.message}</Alert>}
            <Input label="Adresse e-mail" type="email" name="email" value={values.email} onChange={change} error={errors.email} autoComplete="email" required />
            <Input label="Mot de passe" type="password" name="password" value={values.password} onChange={change} error={errors.password} autoComplete="current-password" required />
            <div className="-mt-2 text-right">
                <Link to="/forgot-password" className="text-sm font-medium text-blue-900 dark:text-blue-300 hover:underline">
                    Mot de passe oublié ?
                </Link>
            </div>
            <Button type="submit" loading={submitting} className="w-full">
                Se connecter
            </Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-semibold text-blue-900 dark:text-blue-300 hover:underline">
                    Créer un compte
                </Link>
            </p>
        </form>
    );
}
