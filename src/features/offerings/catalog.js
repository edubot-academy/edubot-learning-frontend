import api, { clean } from '../../shared/api/client';

export async function publicCatalog(params = {}) {
    const { page = 1, limit = 20, q = '', language, signal } = params;
    const { data } = await api.get('/courses/catalog', {
        params: clean({ page, limit, q: q || undefined, language }),
        signal,
    });
    return data;
}
