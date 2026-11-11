import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormationFormModal from '../../components/admin/FormationFormModal';
import FormationCover from '../../components/FormationCover';
import { Alert, Badge, Button, EmptyState, FormationStatusBadge, Input, Loading, PageHeader, Pagination, Select } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api, { errorMessage } from '../../lib/api';
import { levelLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Formations() {
    const { isAdmin } = useAuth();
    const [filters, setFilters] = useState({ search: '', is_published: '', page: 1 });
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
    const { data, meta, loading, error, reload } = useApi('/admin/formations', params);
    const [editing, setEditing] = useState(null);
    const [actionError, setActionError] = useState(null);

    const togglePublication = async (formation) => {
        try {
            setActionError(null);
            await api.put(`/admin/formations/${formation.id}/publication`, { is_published: !formation.is_published });
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    const remove = async (formation) => {
        if (!window.confirm(`Supprimer la formation « ${formation.title} » ? Ses modules, cours, quiz, résultats et certificats seront supprimés.`)) {
            return;
        }

        try {
            await api.delete(`/admin/formations/${formation.id}`);
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    return (
        <>
            <PageHeader
                title={isAdmin ? 'Formations & cours' : 'Mes formations & cours'}
                subtitle={
                    isAdmin
                        ? 'Créez les formations, validez et publiez celles des formateurs.'
                        : 'Créez vos formations, leurs modules, leurs cours et leur évaluation. Un administrateur valide et publie chaque nouvelle formation.'
                }
                actions={<Button onClick={() => setEditing({})}>+ Nouvelle formation</Button>}
            />

            <div className="mb-4 grid max-w-2xl gap-3 sm:grid-cols-2">
                <Input placeholder="Rechercher une formation..." name="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })} />
                <Select
                    name="is_published"
                    value={filters.is_published}
                    onChange={(event) => setFilters({ ...filters, is_published: event.target.value, page: 1 })}
                    placeholder="Tous les statuts"
                    options={[
                        { value: '1', label: 'Publiées' },
                        { value: '0', label: 'En attente de validation' },
                    ]}
                />
            </div>

            <Alert className="mb-4">{error ?? actionError}</Alert>

            {loading && !data && <Loading />}
            {data?.length === 0 && <EmptyState title="Aucune formation" action={<Button onClick={() => setEditing({})}>Créer une formation</Button>} />}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data?.map((formation) => (
                    <div key={formation.id} className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <Link to={`/admin/formations/${formation.id}`}>
                            <FormationCover formation={formation} className="h-28" />
                        </Link>
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <div className="flex items-start justify-between gap-2">
                                <Link to={`/admin/formations/${formation.id}`} className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-900 dark:hover:text-blue-300">
                                    {formation.title}
                                </Link>
                                <FormationStatusBadge formation={formation} />
                            </div>
                            {isAdmin && <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">{formation.trainer ? `Formateur : ${formation.trainer.name}` : 'Sans formateur'}</p>}
                            <div className="flex flex-wrap gap-1.5">
                                <Badge color="blue">{levelLabels[formation.level]}</Badge>
                                <Badge>{formation.modules_count} modules</Badge>
                                <Badge>{formation.courses_count} cours</Badge>
                                <Badge>{formation.enrollments_count} inscrits</Badge>
                                <Badge>{formation.certificates_count} certificats</Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{formation.quiz ? `Évaluation : ${formation.quiz.title} (score requis ${formation.quiz.passing_score}/100)` : 'Pas encore d’évaluation'}</p>
                            <div className="mt-auto flex flex-wrap gap-2 pt-2">
                                <Button size="sm" to={`/admin/formations/${formation.id}`}>
                                    Gérer
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setEditing(formation)}>
                                    Modifier
                                </Button>
                                {isAdmin && (
                                    <Button size="sm" variant={formation.is_published ? 'secondary' : 'success'} onClick={() => togglePublication(formation)}>
                                        {formation.is_published ? 'Retirer' : 'Valider et publier'}
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" className="ml-auto text-red-600 dark:text-red-400" onClick={() => remove(formation)}>
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Pagination meta={meta} onPageChange={(page) => setFilters({ ...filters, page })} />

            {editing && (
                <FormationFormModal
                    formation={editing.id ? editing : null}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        reload();
                    }}
                />
            )}
        </>
    );
}
