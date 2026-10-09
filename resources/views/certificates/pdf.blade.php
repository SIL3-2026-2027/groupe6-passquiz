<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Certificat {{ $certificate->number }}</title>
    <style>
        @page { margin: 0; }
        body { margin: 0; font-family: DejaVu Sans, sans-serif; color: #1f2937; }
        .frame { position: absolute; top: 28px; right: 28px; bottom: 28px; left: 28px; border: 6px double #1e3a8a; padding: 40px 60px; text-align: center; }
        .brand { font-size: 30px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a; margin-top: 10px; }
        .title { font-size: 22px; letter-spacing: 4px; margin: 18px 0 34px; }
        .label { font-size: 15px; color: #4b5563; margin: 10px 0; }
        .name { font-size: 34px; font-weight: bold; margin: 8px 0 18px; }
        .formation { font-size: 26px; font-weight: bold; color: #1e3a8a; margin: 8px 0 18px; }
        .score { font-size: 17px; margin-bottom: 40px; }
        .footer { width: 100%; margin-top: 90px; font-size: 13px; color: #4b5563; }
        .footer td { width: 50%; }
    </style>
</head>
<body>
    <div class="frame">
        <div class="brand">PASSQUIZ</div>
        <div class="title">CERTIFICAT DE RÉUSSITE</div>

        <div class="label">Nous certifions que</div>
        <div class="name">{{ $certificate->user->name }}</div>

        <div class="label">a réussi la formation</div>
        <div class="formation">{{ $certificate->formation->title }}</div>

        <div class="score">avec un score de {{ $certificate->score }} %</div>

        <table class="footer">
            <tr>
                <td style="text-align: left;">Date : {{ $issuedOn }}</td>
                <td style="text-align: right;">Certificat N° : {{ $certificate->number }}</td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: center; font-size: 11px; padding-top: 8px;">
                    Vérifiez l'authenticité de ce certificat sur {{ url('/verify/'.$certificate->number) }}
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
