import api from '../../shared/api/client';

export async function publicCatalog(params = {}) {
    const { page = 1, limit = 20, q = '', language } = params;
    const { data } = await api.get('/courses/catalog', {
        params: { page, limit, q, language },
    });
    return data;
}
