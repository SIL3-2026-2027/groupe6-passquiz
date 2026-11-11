import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false }) {
    return (
        <Link to={to} className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-900 dark:bg-blue-600 text-sm font-bold text-white">PQ</span>
            <span className={`text-lg font-bold tracking-wide ${light ? 'text-white' : 'text-blue-900 dark:text-blue-300'}`}>PassQuiz</span>
        </Link>
    );
}
