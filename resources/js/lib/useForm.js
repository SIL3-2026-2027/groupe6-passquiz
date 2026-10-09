import { useState } from 'react';
import { errorMessage, validationErrors } from './api';

/**
 * Gestion simple d'un formulaire : valeurs, erreurs de validation et envoi.
 */
export default function useForm(initialValues) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const setField = (name, value) => setValues((previous) => ({ ...previous, [name]: value }));

    const bind = (name) => ({
        name,
        value: values[name] ?? '',
        onChange: (event) => setField(name, event.target.value),
        error: errors[name],
    });

    const submit = async (callback) => {
        setSubmitting(true);
        setErrors({});
        setMessage(null);

        try {
            return await callback(values);
        } catch (error) {
            setErrors(validationErrors(error));
            setMessage(errorMessage(error));

            return null;
        } finally {
            setSubmitting(false);
        }
    };

    return { values, setValues, setField, bind, errors, message, submitting, submit };
}
