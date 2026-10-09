import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from './api';

/**
 * Charge une ressource de l'API : { data, meta, loading, error, reload }.
 */
export default function useApi(url, params = null) {
    const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
    const paramsKey = JSON.stringify(params);

    const load = useCallback(() => {
        if (!url) {
            return Promise.resolve();
        }

        setState((previous) => ({ ...previous, loading: true, error: null }));

        return api
            .get(url, { params: params ?? undefined })
            .then(({ data }) => setState({ data: data.data, meta: data.meta ?? null, loading: false, error: null }))
            .catch((error) => setState({ data: null, meta: null, loading: false, error: errorMessage(error) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, paramsKey]);

    useEffect(() => {
        load();
    }, [load]);

    return { ...state, reload: load };
}
