import api from '../../lib/api';
import useForm from '../../lib/useForm';
import { Alert, Button, Input, Modal, Select, Textarea } from '../ui';

const emptyAnswer = () => ({ text: '', is_correct: false });

const trueFalseAnswers = (answers) => [
    { ...answers[0], text: 'Vrai', is_correct: answers[0]?.is_correct ?? true },
    { ...answers[1], text: 'Faux', is_correct: !(answers[0]?.is_correct ?? true) },
];

export default function QuestionFormModal({ quizId, question, nextPosition = 1, onClose, onSaved }) {
    const form = useForm({
        text: question?.text ?? '',
        type: question?.type ?? 'single',
        points: question?.points ?? 1,
        position: question?.position ?? nextPosition,
        explanation: question?.explanation ?? '',
        answers: question?.answers.map((answer) => ({ id: answer.id, text: answer.text, is_correct: answer.is_correct })) ?? [emptyAnswer(), emptyAnswer()],
    });

    const answers = form.values.answers;
    const isTrueFalse = form.values.type === 'true_false';

    const updateAnswer = (index, changes) => {
        let next = answers.map((answer, position) => (position === index ? { ...answer, ...changes } : answer));

        if (changes.is_correct && form.values.type !== 'multiple') {
            next = next.map((answer, position) => ({ ...answer, is_correct: position === index }));
        }

        form.setField('answers', next);
    };

    const changeType = (type) => {
        form.setField('type', type);

        if (type === 'true_false') {
            form.setField('answers', trueFalseAnswers(answers));
        } else if (type === 'single') {
            const firstCorrect = answers.findIndex((answer) => answer.is_correct);
            form.setField(
                'answers',
                answers.map((answer, index) => ({ ...answer, is_correct: index === firstCorrect })),
            );
        }
    };

    const save = () =>
        form.submit(async (values) => {
            const { data } = question ? await api.put(`/admin/questions/${question.id}`, values) : await api.post(`/admin/quizzes/${quizId}/questions`, values);
            onSaved(data.data);
        });

    const answerErrors = Object.entries(form.errors).filter(([field]) => field.startsWith('answers'));

    return (
        <Modal
            open
            size="xl"
            title={question ? 'Modifier la question' : 'Nouvelle question'}
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
                <Textarea label="Question" rows={2} {...form.bind('text')} />
                <div className="grid gap-4 sm:grid-cols-3">
                    <Select
                        label="Type"
                        name="type"
                        value={form.values.type}
                        onChange={(event) => changeType(event.target.value)}
                        options={[
                            { value: 'single', label: 'Choix unique' },
                            { value: 'multiple', label: 'Choix multiples' },
                            { value: 'true_false', label: 'Vrai / Faux' },
                        ]}
                    />
                    <Input label="Points" type="number" min={1} {...form.bind('points')} />
                    <Input label="Ordre" type="number" min={1} {...form.bind('position')} />
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{isTrueFalse ? 'Cochez la bonne réponse' : 'Réponses (cochez la ou les bonnes réponses)'}</p>
                        {!isTrueFalse && (
                            <Button variant="secondary" size="sm" onClick={() => form.setField('answers', [...answers, emptyAnswer()])}>
                                + Ajouter une réponse
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {answers.map((answer, index) => (
                            <div key={answer.id ?? `new-${index}`} className={`flex items-center gap-3 rounded-lg p-2 ring-1 ${answer.is_correct ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-300 dark:ring-emerald-700' : 'ring-slate-200 dark:ring-slate-800'}`}>
                                <input
                                    type={form.values.type === 'multiple' ? 'checkbox' : 'radio'}
                                    name="correct-answer"
                                    checked={answer.is_correct}
                                    onChange={(event) => updateAnswer(index, { is_correct: event.target.checked })}
                                    className="size-4 text-emerald-600 dark:text-emerald-400 focus:ring-emerald-600"
                                    title="Bonne réponse"
                                />
                                <input
                                    value={answer.text}
                                    onChange={(event) => updateAnswer(index, { text: event.target.value })}
                                    placeholder={`Réponse ${index + 1}`}
                                    readOnly={isTrueFalse}
                                    className="flex-1 rounded-md border-0 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    disabled={answers.length <= 2 || isTrueFalse}
                                    onClick={() => form.setField('answers', answers.filter((_, position) => position !== index))}
                                    className="rounded-md px-2 py-1 text-sm text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30"
                                    title="Supprimer"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    {answerErrors.length > 0 && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{answerErrors[0][1]}</p>}
                </div>

                <Textarea label="Explication (visible par l'administrateur)" rows={2} {...form.bind('explanation')} />
            </div>
        </Modal>
    );
}
