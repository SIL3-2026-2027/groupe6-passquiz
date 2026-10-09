import { Link } from 'react-router-dom';

const buttonVariants = {
    primary: 'bg-blue-900 text-white hover:bg-blue-800 focus-visible:outline-blue-900',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-emerald-600',
    ghost: 'text-slate-600 hover:bg-slate-100',
};

const buttonSizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

export function Button({ variant = 'primary', size = 'md', loading = false, to, className = '', children, ...props }) {
    const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`;

    if (to) {
        return (
            <Link to={to} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} disabled={loading || props.disabled} {...props}>
            {loading && <Spinner className="size-4" />}
            {children}
        </button>
    );
}

export function Spinner({ className = 'size-6' }) {
    return (
        <svg className={`animate-spin text-current ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

export function Loading({ label = 'Chargement...' }) {
    return (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
            <Spinner />
            <span>{label}</span>
        </div>
    );
}

export function Alert({ type = 'error', children, className = '' }) {
    const styles = {
        error: 'bg-red-50 text-red-800 ring-red-200',
        success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
        info: 'bg-blue-50 text-blue-800 ring-blue-200',
        warning: 'bg-amber-50 text-amber-800 ring-amber-200',
    };

    if (!children) {
        return null;
    }

    return <div className={`rounded-lg px-4 py-3 text-sm ring-1 ${styles[type]} ${className}`}>{children}</div>;
}

export function Card({ className = '', children }) {
    const padding = /(^|\s)p-0(\s|$)/.test(className) ? '' : 'p-5';

    return <div className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-200 ${padding} ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions, back }) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                {back && (
                    <Link to={back.to} className="mb-2 inline-block text-sm text-slate-500 hover:text-blue-900">
                        ← {back.label}
                    </Link>
                )}
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

const badgeColors = {
    gray: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    amber: 'bg-amber-100 text-amber-800',
    purple: 'bg-purple-100 text-purple-800',
};

export function Badge({ color = 'gray', children }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[color]}`}>
            {children}
        </span>
    );
}

export function AttemptStatusBadge({ attempt }) {
    const colors = { passed: 'green', failed: 'amber', in_progress: 'blue' };

    return <Badge color={colors[attempt.status]}>{attempt.status_label}</Badge>;
}

export function ProgressBar({ percent = 0, size = 'md' }) {
    const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
    const color = percent === 100 ? 'bg-emerald-500' : 'bg-blue-900';

    return (
        <div className="flex items-center gap-3">
            <div className={`w-full overflow-hidden rounded-full bg-slate-200 ${height}`}>
                <div className={`${height} rounded-full ${color} transition-all`} style={{ width: `${percent}%` }} />
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-semibold text-slate-700">{percent} %</span>
        </div>
    );
}

export function StatCard({ label, value, hint }) {
    return (
        <Card>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </Card>
    );
}

export function EmptyState({ title, description, action }) {
    return (
        <div className="rounded-xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
            <p className="font-semibold text-slate-700">{title}</p>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

function FieldWrapper({ label, error, hint, htmlFor, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            {children}
            {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

const inputClasses = (error) =>
    `block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:outline-none ${
        error ? 'ring-red-400 focus:ring-red-500' : 'ring-slate-300 focus:ring-blue-900'
    }`;

export function Input({ label, error, hint, id, name, ...props }) {
    const inputId = id ?? name;

    return (
        <FieldWrapper label={label} error={error} hint={hint} htmlFor={inputId}>
            <input id={inputId} name={name} className={inputClasses(error)} {...props} />
        </FieldWrapper>
    );
}

export function Textarea({ label, error, hint, id, name, rows = 4, ...props }) {
    const inputId = id ?? name;

    return (
        <FieldWrapper label={label} error={error} hint={hint} htmlFor={inputId}>
            <textarea id={inputId} name={name} rows={rows} className={inputClasses(error)} {...props} />
        </FieldWrapper>
    );
}

export function Select({ label, error, hint, id, name, options, placeholder, ...props }) {
    const inputId = id ?? name;

    return (
        <FieldWrapper label={label} error={error} hint={hint} htmlFor={inputId}>
            <select id={inputId} name={name} className={inputClasses(error)} {...props}>
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FieldWrapper>
    );
}

export function Checkbox({ label, checked, onChange, name }) {
    return (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
            />
            {label}
        </label>
    );
}

export function Modal({ open, title, onClose, children, footer, size = 'lg' }) {
    if (!open) {
        return null;
    }

    const widths = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center">
            <div className={`my-8 w-full ${widths[size]} rounded-xl bg-white shadow-xl`}>
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Fermer">
                        ✕
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
            </div>
        </div>
    );
}

export function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    return (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
                {meta.from}–{meta.to} sur {meta.total}
            </span>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={meta.current_page === 1} onClick={() => onPageChange(meta.current_page - 1)}>
                    Précédent
                </Button>
                <span className="self-center">
                    Page {meta.current_page} / {meta.last_page}
                </span>
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                >
                    Suivant
                </Button>
            </div>
        </div>
    );
}

export function Table({ headers, children, empty }) {
    return (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="px-4 py-3 text-left font-semibold whitespace-nowrap text-slate-600">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">{children}</tbody>
            </table>
            {empty}
        </div>
    );
}

export function Td({ className = '', children, ...props }) {
    return (
        <td className={`px-4 py-3 align-middle text-slate-700 ${className}`} {...props}>
            {children}
        </td>
    );
}
