import { useState } from 'react';
import { useParams } from 'react-router-dom';
import UserFormModal from '../../components/admin/UserFormModal';
import { Alert, AttemptStatusBadge, Badge, Button, Card, EmptyState, Loading, PageHeader, ProgressBar } from '../../components/ui';
import { formatDate, roleColors, roleLabels } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function UserShow() {
    const { id } = useParams();
    const { data, loading, error, reload } = useApi(`/admin/users/${id}/progress`);
    const [editing, setEditing] = useState(false);

    if (loading && !data) {
        return <Loading />;
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    const { user, formations } = data;

    return (
        <>
            <PageHeader
                back={{ to: '/admin/users', label: 'Utilisateurs' }}
                title={user.name}
                subtitle={`${user.email} · inscrit le ${formatDate(user.created_at)}`}
                actions={
                    <>
                        <Button variant="secondary" to={`/admin/attempts?user_id=${user.id}`}>
                            Voir ses résultats
                        </Button>
                        <Button onClick={() => setEditing(true)}>Modifier</Button>
                    </>
                }
            />

            <div className="mb-6 flex gap-2">
                <Badge color={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                {user.is_active ? <Badge color="green">Compte actif</Badge> : <Badge color="red">Compte désactivé</Badge>}
            </div>

            <h2 className="mb-3 text-lg font-bold text-slate-900">Progression par formation</h2>
            {formations.length === 0 ? (
                <EmptyState title="Cet utilisateur n'est inscrit à aucune formation" />
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {formations.map((formation) => (
                        <Card key={formation.id}>
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{formation.title}</h3>
                                    <p className="text-xs text-slate-500">
                                        Inscrit le {formatDate(formation.enrolled_at)}
                                        {formation.completed_at && ` · cours terminés le ${formatDate(formation.completed_at)}`}
                                    </p>
                                </div>
                                {formation.certificate && !formation.certificate.is_revoked && <Badge color="green">Certifié</Badge>}
                            </div>
                            <ProgressBar percent={formation.progress.percent} />
                            <p className="mt-1 text-xs text-slate-500">
                                {formation.progress.completed_courses} cours terminés sur {formation.progress.total_courses}
                            </p>

                            <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center text-sm">
                                <div>
                                    <dt className="text-xs text-slate-500">Tentatives</dt>
                                    <dd className="font-bold text-slate-900">{formation.quiz.attempts_count}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-slate-500">Meilleur score</dt>
                                    <dd className="font-bold text-slate-900">{formation.quiz.best_score !== null ? `${formation.quiz.best_score} %` : '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-slate-500">Dernier résultat</dt>
                                    <dd>{formation.quiz.last_attempt ? <AttemptStatusBadge attempt={formation.quiz.last_attempt} /> : '—'}</dd>
                                </div>
                            </dl>
                            {formation.certificate && <p className="mt-3 font-mono text-xs text-slate-500">Certificat {formation.certificate.number}</p>}
                        </Card>
                    ))}
                </div>
            )}

            {editing && (
                <UserFormModal
                    user={user}
                    onClose={() => setEditing(false)}
                    onSaved={() => {
                        setEditing(false);
                        reload();
                    }}
                />
            )}
        </>
    );
}
