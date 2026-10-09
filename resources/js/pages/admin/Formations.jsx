import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormationFormModal from '../../components/admin/FormationFormModal';
import FormationCover from '../../components/FormationCover';
import { Alert, Badge, Button, EmptyState, Input, Loading, PageHeader, Pagination } from '../../components/ui';
import api, { errorMessage } from '../../lib/api';
import { levelLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Formations() {
    const [filters, setFilters] = useState({ search: '', page: 1 });
    const { data, meta, loading, error, reload } = useApi('/admin/formations', filters.search ? filters : { page: filters.page });
    const [editing, setEditing] = useState(null);
    const [actionError, setActionError] = useState(null);

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
            <PageHeader title="Formations & cours" subtitle="Créez les formations, leurs modules, leurs cours et leur évaluation." actions={<Button onClick={() => setEditing({})}>+ Nouvelle formation</Button>} />

            <div className="mb-4 max-w-sm">
                <Input placeholder="Rechercher une formation..." name="search" value={filters.search} onChange={(event) => setFilters({ search: event.target.value, page: 1 })} />
            </div>

            <Alert className="mb-4">{error ?? actionError}</Alert>

            {loading && !data && <Loading />}
            {data?.length === 0 && <EmptyState title="Aucune formation" action={<Button onClick={() => setEditing({})}>Créer une formation</Button>} />}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data?.map((formation) => (
                    <div key={formation.id} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                        <Link to={`/admin/formations/${formation.id}`}>
                            <FormationCover formation={formation} className="h-28" />
                        </Link>
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <div className="flex items-start justify-between gap-2">
                                <Link to={`/admin/formations/${formation.id}`} className="text-lg font-bold text-slate-900 hover:text-blue-900">
                                    {formation.title}
                                </Link>
                                {formation.is_published ? <Badge color="green">Publiée</Badge> : <Badge color="amber">Brouillon</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge color="blue">{levelLabels[formation.level]}</Badge>
                                <Badge>{formation.modules_count} modules</Badge>
                                <Badge>{formation.courses_count} cours</Badge>
                                <Badge>{formation.enrollments_count} inscrits</Badge>
                                <Badge>{formation.certificates_count} certificats</Badge>
                            </div>
                            <p className="text-xs text-slate-500">{formation.quiz ? `Évaluation : ${formation.quiz.title} (score requis ${formation.quiz.passing_score}/100)` : 'Pas encore d’évaluation'}</p>
                            <div className="mt-auto flex gap-2 pt-2">
                                <Button size="sm" to={`/admin/formations/${formation.id}`}>
                                    Gérer
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setEditing(formation)}>
                                    Modifier
                                </Button>
                                <Button size="sm" variant="ghost" className="ml-auto text-red-600" onClick={() => remove(formation)}>
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
