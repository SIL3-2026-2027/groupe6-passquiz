export function formatDate(value, withTime = false) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
}

export const levelLabels = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
};

export const roleLabels = {
    admin: 'Administrateur',
    trainer: 'Formateur',
    learner: 'Apprenant',
};

export const roleColors = {
    admin: 'purple',
    trainer: 'amber',
    learner: 'blue',
};

/**
 * Page d'accueil selon le rôle : espace de gestion pour l'équipe, tableau de bord pour les apprenants.
 */
export function homePath(user) {
    return ['admin', 'trainer'].includes(user.role) ? '/admin' : '/dashboard';
}

export const questionTypeLabels = {
    single: 'Choix unique',
    multiple: 'Choix multiples',
    true_false: 'Vrai / Faux',
};

/**
 * Transforme une URL YouTube / Vimeo en URL intégrable, sinon null.
 */
export function embedVideoUrl(url) {
    if (!url) {
        return null;
    }

    const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);

    if (youtube) {
        return `https://www.youtube.com/embed/${youtube[1]}`;
    }

    const vimeo = url.match(/vimeo\.com\/(\d+)/);

    if (vimeo) {
        return `https://player.vimeo.com/video/${vimeo[1]}`;
    }

    return null;
}
