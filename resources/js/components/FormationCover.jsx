const gradients = ['from-blue-900 to-blue-600', 'from-cyan-700 to-sky-500', 'from-indigo-800 to-violet-600', 'from-emerald-700 to-teal-500'];

/**
 * Image de la formation, ou bandeau coloré avec son code (ex : LAR).
 */
export default function FormationCover({ formation, className = 'h-36' }) {
    if (formation.image_url) {
        return <img src={formation.image_url} alt={formation.title} className={`w-full object-cover ${className}`} />;
    }

    return (
        <div className={`flex w-full items-center justify-center bg-gradient-to-br ${gradients[formation.id % gradients.length]} ${className}`}>
            <span className="text-4xl font-black tracking-widest text-white/90">{formation.code}</span>
        </div>
    );
}
