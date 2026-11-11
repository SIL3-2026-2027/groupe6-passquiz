/**
 * Texte de question ou de réponse : blocs de code (```jsx … ```) et code en ligne (`…`), le reste tel quel.
 * Le rendu se fait en éléments React : aucune balise HTML saisie n'est interprétée.
 */
export default function RichText({ text }) {
    if (!text) {
        return null;
    }

    return text.split(/```[\w-]*\n?([\s\S]*?)```/).map((part, index) =>
        index % 2 === 1 ? (
            <pre key={index} className="my-3 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-sm leading-normal font-normal text-slate-100 dark:bg-slate-950 dark:ring-1 dark:ring-slate-800">
                {part.replace(/\n$/, '')}
            </pre>
        ) : (
            <InlineCode key={index} text={part.trim() === '' ? '' : part.replace(/^\n+|\n+$/g, '')} />
        ),
    );
}

function InlineCode({ text }) {
    return (
        <span className="whitespace-pre-line">
            {text.split(/`([^`]+)`/).map((part, index) =>
                index % 2 === 1 ? (
                    <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] font-normal text-pink-700 dark:bg-slate-800 dark:text-pink-300">
                        {part}
                    </code>
                ) : (
                    part
                ),
            )}
        </span>
    );
}
