import { useState } from 'react';
import UserFormModal from '../../components/admin/UserFormModal';
import { Alert, Badge, Button, Input, Loading, PageHeader, Pagination, Select, Table, Td } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api, { errorMessage } from '../../lib/api';
import { formatDate, roleColors, roleLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [filters, setFilters] = useState({ search: '', role: '', is_active: '', page: 1 });
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
    const { data, meta, loading, error, reload } = useApi('/admin/users', params);
    const [editing, setEditing] = useState(null);
    const [actionError, setActionError] = useState(null);

    const setFilter = (name, value) => setFilters({ ...filters, [name]: value, page: 1 });

    const remove = async (user) => {
        if (!window.confirm(`Supprimer définitivement ${user.name} ? Toutes ses données seront perdues.`)) {
            return;
        }

        try {
            await api.delete(`/admin/users/${user.id}`);
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    return (
        <>
            <PageHeader title="Utilisateurs" subtitle="Gérez les comptes des apprenants, formateurs et administrateurs." actions={<Button onClick={() => setEditing({})}>+ Nouvel utilisateur</Button>} />

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <Input placeholder="Rechercher un nom ou un e-mail..." name="search" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} />
                <Select
                    name="role"
                    value={filters.role}
                    onChange={(event) => setFilter('role', event.target.value)}
                    placeholder="Tous les rôles"
                    options={[
                        { value: 'learner', label: 'Apprenants' },
                        { value: 'trainer', label: 'Formateurs' },
                        { value: 'admin', label: 'Administrateurs' },
                    ]}
                />
                <Select
                    name="is_active"
                    value={filters.is_active}
                    onChange={(event) => setFilter('is_active', event.target.value)}
                    placeholder="Tous les statuts"
                    options={[
                        { value: '1', label: 'Actifs' },
                        { value: '0', label: 'Désactivés' },
                    ]}
                />
            </div>

            <Alert className="mb-4">{error ?? actionError}</Alert>

            {loading && !data ? (
                <Loading />
            ) : (
                <>
                    <Table headers={['Nom', 'Rôle', 'Statut', 'Formations', 'Certificats', 'Inscrit le', '']}>
                        {data?.map((user) => (
                            <tr key={user.id}>
                                <Td>
                                    <p className="font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </Td>
                                <Td>
                                    <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                                </Td>
                                <Td>{user.is_active ? <Badge color="green">Actif</Badge> : <Badge color="red">Désactivé</Badge>}</Td>
                                <Td>{user.enrollments_count}</Td>
                                <Td>{user.certificates_count}</Td>
                                <Td>{formatDate(user.created_at)}</Td>
                                <Td className="text-right whitespace-nowrap">
                                    <Button variant="ghost" size="sm" to={`/admin/users/${user.id}`}>
                                        Progression
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditing(user)}>
                                        Modifier
                                    </Button>
                                    {user.id !== currentUser.id && (
                                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(user)}>
                                            Supprimer
                                        </Button>
                                    )}
                                </Td>
                            </tr>
                        ))}
                    </Table>
                    {data?.length === 0 && <p className="mt-4 text-center text-sm text-slate-500">Aucun utilisateur trouvé.</p>}
                    <Pagination meta={meta} onPageChange={(page) => setFilters({ ...filters, page })} />
                </>
            )}

            {editing && (
                <UserFormModal
                    user={editing.id ? editing : null}
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
