import { useState } from 'react';
import { Alert, Badge, Button, Input, Loading, Modal, PageHeader, Pagination, Select, Table, Td } from '../../components/ui';
import api, { downloadFile, errorMessage } from '../../lib/api';
import { formatDate } from '../../lib/format';
import useApi from '../../lib/useApi';
import useForm from '../../lib/useForm';

function IssueCertificateModal({ onClose, onSaved }) {
    const { data: users } = useApi('/admin/users', { role: 'learner', per_page: 200 });
    const { data: formations } = useApi('/admin/formations', { per_page: 100 });
    const form = useForm({ user_id: '', formation_id: '', score: 70 });

    const save = () =>
        form.submit(async (values) => {
            await api.post('/admin/certificates', values);
            onSaved();
        });

    return (
        <Modal
            open
            size="md"
            title="Délivrer un certificat"
            onClose={onClose}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={save} loading={form.submitting}>
                        Délivrer
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <Select label="Apprenant" {...form.bind('user_id')} placeholder="Choisir un apprenant" options={(users ?? []).map((user) => ({ value: user.id, label: `${user.name} (${user.email})` }))} />
                <Select label="Formation" {...form.bind('formation_id')} placeholder="Choisir une formation" options={(formations ?? []).map((formation) => ({ value: formation.id, label: formation.title }))} />
                <Input label="Score (/100)" type="number" min={0} max={100} {...form.bind('score')} />
            </div>
        </Modal>
    );
}

export default function Certificates() {
    const [filters, setFilters] = useState({ search: '', status: '', formation_id: '', page: 1 });
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
    const { data, meta, loading, error, reload } = useApi('/admin/certificates', params);
    const { data: formations } = useApi('/admin/formations', { per_page: 100 });
    const [issuing, setIssuing] = useState(false);
    const [actionError, setActionError] = useState(null);

    const setFilter = (name, value) => setFilters({ ...filters, [name]: value, page: 1 });

    const run = async (request) => {
        try {
            setActionError(null);
            await request();
            reload();
        } catch (exception) {
            setActionError(errorMessage(exception));
        }
    };

    const revoke = (certificate) => {
        const reason = window.prompt(`Révoquer le certificat ${certificate.number} ? Indiquez le motif (facultatif) :`);

        if (reason !== null) {
            run(() => api.post(`/admin/certificates/${certificate.id}/revoke`, { reason: reason || null }));
        }
    };

    const remove = (certificate) => {
        if (window.confirm(`Supprimer définitivement le certificat ${certificate.number} ?`)) {
            run(() => api.delete(`/admin/certificates/${certificate.id}`));
        }
    };

    return (
        <>
            <PageHeader title="Certificats" subtitle="Certificats délivrés automatiquement après réussite, ou manuellement." actions={<Button onClick={() => setIssuing(true)}>+ Délivrer un certificat</Button>} />

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <Input placeholder="N° de certificat, nom ou e-mail..." name="search" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} />
                <Select
                    name="formation_id"
                    value={filters.formation_id}
                    onChange={(event) => setFilter('formation_id', event.target.value)}
                    placeholder="Toutes les formations"
                    options={(formations ?? []).map((formation) => ({ value: formation.id, label: formation.title }))}
                />
                <Select
                    name="status"
                    value={filters.status}
                    onChange={(event) => setFilter('status', event.target.value)}
                    placeholder="Tous les statuts"
                    options={[
                        { value: 'valid', label: 'Valides' },
                        { value: 'revoked', label: 'Révoqués' },
                    ]}
                />
            </div>

            <Alert className="mb-4">{error ?? actionError}</Alert>

            {loading && !data ? (
                <Loading />
            ) : (
                <>
                    <Table headers={['N° certificat', 'Apprenant', 'Formation', 'Score', 'Délivré le', 'Statut', '']}>
                        {data?.map((certificate) => (
                            <tr key={certificate.id}>
                                <Td className="font-mono text-xs">{certificate.number}</Td>
                                <Td>
                                    <p className="font-semibold text-slate-900">{certificate.user.name}</p>
                                    <p className="text-xs text-slate-500">{certificate.user.email}</p>
                                </Td>
                                <Td>{certificate.formation.title}</Td>
                                <Td>{certificate.score} %</Td>
                                <Td>{formatDate(certificate.issued_at)}</Td>
                                <Td>
                                    {certificate.is_revoked ? (
                                        <span title={certificate.revocation_reason ?? ''}>
                                            <Badge color="red">Révoqué</Badge>
                                        </span>
                                    ) : (
                                        <Badge color="green">Valide</Badge>
                                    )}
                                </Td>
                                <Td className="text-right whitespace-nowrap">
                                    <Button variant="ghost" size="sm" onClick={() => downloadFile(certificate.download_url, `certificat-${certificate.number}.pdf`)}>
                                        PDF
                                    </Button>
                                    {certificate.is_revoked ? (
                                        <Button variant="ghost" size="sm" onClick={() => run(() => api.post(`/admin/certificates/${certificate.id}/restore`))}>
                                            Rétablir
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="sm" className="text-amber-700" onClick={() => revoke(certificate)}>
                                            Révoquer
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(certificate)}>
                                        Supprimer
                                    </Button>
                                </Td>
                            </tr>
                        ))}
                    </Table>
                    {data?.length === 0 && <p className="mt-4 text-center text-sm text-slate-500">Aucun certificat.</p>}
                    <Pagination meta={meta} onPageChange={(page) => setFilters({ ...filters, page })} />
                </>
            )}

            {issuing && (
                <IssueCertificateModal
                    onClose={() => setIssuing(false)}
                    onSaved={() => {
                        setIssuing(false);
                        reload();
                    }}
                />
            )}
        </>
    );
}
