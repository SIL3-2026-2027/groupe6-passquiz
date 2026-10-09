import Icon from '../../components/Icon';
import { Alert, Button, Card, EmptyState, Loading, PageHeader } from '../../components/ui';
import { downloadFile } from '../../lib/api';
import { formatDate } from '../../lib/format';
import useApi from '../../lib/useApi';

export default function Certificates() {
    const { data, loading, error } = useApi('/certificates');

    return (
        <>
            <PageHeader title="Mes certificats" subtitle="Téléchargez les certificats des formations que vous avez réussies." />
            <Alert>{error}</Alert>
            {loading && <Loading />}
            {data?.length === 0 && (
                <EmptyState
                    title="Aucun certificat pour le moment"
                    description="Réussissez l'évaluation finale d'une formation pour obtenir votre certificat."
                    action={<Button to="/formations">Voir les formations</Button>}
                />
            )}
            <div className="grid gap-6 md:grid-cols-2">
                {data?.map((certificate) => (
                    <Card key={certificate.id} className="relative overflow-hidden border-t-4 border-blue-900">
                        <div className="flex items-start gap-4">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                <Icon name="award" className="size-6" />
                            </span>
                            <div className="flex-1">
                                <p className="text-xs font-semibold tracking-widest text-blue-900 uppercase">Certificat de réussite</p>
                                <h2 className="text-xl font-bold text-slate-900">{certificate.formation.title}</h2>
                                <p className="mt-1 text-sm text-slate-600">Score : {certificate.score} %</p>
                                <p className="text-sm text-slate-600">Délivré le {formatDate(certificate.issued_at)}</p>
                                <p className="mt-1 font-mono text-xs text-slate-500">N° {certificate.number}</p>
                                <a href={certificate.verification_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium text-blue-900 hover:underline">
                                    Lien public de vérification ↗
                                </a>
                            </div>
                        </div>
                        <Button className="mt-4 w-full" onClick={() => downloadFile(certificate.download_url, `certificat-${certificate.number}.pdf`)}>
                            Télécharger le PDF
                        </Button>
                    </Card>
                ))}
            </div>
        </>
    );
}
