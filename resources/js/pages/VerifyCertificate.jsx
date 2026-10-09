import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { Alert, Button, Input, Spinner } from '../components/ui';
import { formatDate } from '../lib/format';
import useApi from '../lib/useApi';

function VerificationResult({ number }) {
    const { data: certificate, loading, error } = useApi(`/certificates/verify/${encodeURIComponent(number)}`);

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <Alert>{error}</Alert>;
    }

    return (
        <div className={`rounded-xl p-5 ring-1 ${certificate.is_valid ? 'bg-emerald-50 ring-emerald-200' : 'bg-red-50 ring-red-200'}`}>
            <div className="mb-4 flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-full ${certificate.is_valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    <Icon name={certificate.is_valid ? 'check' : 'x'} />
                </span>
                <div>
                    <p className={`font-bold ${certificate.is_valid ? 'text-emerald-800' : 'text-red-800'}`}>{certificate.is_valid ? 'Certificat authentique' : 'Certificat révoqué'}</p>
                    <p className="font-mono text-xs text-slate-500">N° {certificate.number}</p>
                </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-slate-500">Titulaire</dt>
                <dd className="font-semibold text-slate-900">{certificate.holder_name}</dd>
                <dt className="text-slate-500">Formation</dt>
                <dd className="font-semibold text-slate-900">{certificate.formation_title}</dd>
                <dt className="text-slate-500">Score</dt>
                <dd className="text-slate-900">{certificate.score} %</dd>
                <dt className="text-slate-500">Délivré le</dt>
                <dd className="text-slate-900">{formatDate(certificate.issued_at)}</dd>
                {!certificate.is_valid && (
                    <>
                        <dt className="text-slate-500">Révoqué le</dt>
                        <dd className="text-red-700">{formatDate(certificate.revoked_at)}</dd>
                    </>
                )}
            </dl>
        </div>
    );
}

/**
 * Page publique : vérifie l'authenticité d'un certificat à partir de son numéro.
 */
export default function VerifyCertificate() {
    const { number } = useParams();
    const navigate = useNavigate();
    const [value, setValue] = useState(number ?? '');

    const search = (event) => {
        event.preventDefault();

        if (value.trim()) {
            navigate(`/verify/${encodeURIComponent(value.trim().toUpperCase())}`);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 px-4 py-12">
            <div className="mb-8">
                <Logo light />
            </div>
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                <h1 className="text-xl font-bold text-slate-900">Vérifier un certificat</h1>
                <p className="mt-1 mb-6 text-sm text-slate-500">Saisissez le numéro imprimé sur le certificat (ex. PQ-LAR-2026-00001).</p>
                <form onSubmit={search} className="mb-6 flex gap-2">
                    <div className="flex-1">
                        <Input name="number" placeholder="Numéro du certificat" value={value} onChange={(event) => setValue(event.target.value)} />
                    </div>
                    <Button type="submit">Vérifier</Button>
                </form>
                {number && <VerificationResult key={number} number={number} />}
            </div>
        </div>
    );
}
