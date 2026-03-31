let refreshHandler = null;
let inflightRefreshPromise = null;

export const registerRefreshHandler = (handler) => {
    refreshHandler = typeof handler === 'function' ? handler : null;

    return () => {
        if (refreshHandler === handler) {
            refreshHandler = null;
        }
    };
};

export const clearRefreshHandler = () => {
    refreshHandler = null;
};

export const runRefreshFlow = async () => {
    if (!refreshHandler) {
        throw new Error('No refresh handler is registered.');
    }

    if (inflightRefreshPromise) {
        return inflightRefreshPromise;
    }

    inflightRefreshPromise = Promise.resolve()
        .then(() => refreshHandler())
        .finally(() => {
            inflightRefreshPromise = null;
        });

    return inflightRefreshPromise;
};
