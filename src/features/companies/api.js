import api, { clean } from '../../shared/api/client';

export async function listCompanies({ page = 1, limit = 20, q = '' } = {}) {
    const { data } = await api.get('/companies', { params: clean({ page, limit, q }) });
    return data;
}

export async function myCompanies({ page = 1, limit = 20, q = '' } = {}) {
    const { data } = await api.get('/companies/my', { params: clean({ page, limit, q }) });
    return data;
}

export async function getCompany(id) {
    const { data } = await api.get(`/companies/${id}`);
    return data;
}

export async function createCompany(payload) {
    const { data } = await api.post('/companies', payload);
    return data;
}

export async function updateCompany(id, patch) {
    const { data } = await api.patch(`/companies/${id}`, patch);
    return data;
}

export async function deleteCompany(id) {
    const { data } = await api.delete(`/companies/${id}`);
    return data;
}

export const assignCourseToCompany = async (courseId, companyId) => {
    const { data } = await api.post(`/courses/${courseId}/companies/${companyId}`);
    return data;
};

export const unassignCourseFromCompany = async (courseId, companyId) => {
    const { data } = await api.delete(`/courses/${courseId}/companies/${companyId}`);
    return data;
};

export const clearCourseCompany = async (courseId) => {
    const { data } = await api.delete(`/courses/${courseId}/companies`);
    return data;
};

export async function uploadCompanyLogo(companyId, file) {
    if (!file) throw new Error('No file provided');

    const form = new FormData();
    form.append('logo', file);

    const { data } = await api.post(`/companies/${companyId}/upload-logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.logoUrl || data.url || null;
}

export async function listCompanyMembers(companyId) {
    const { data } = await api.get(`/companies/${companyId}/members`);
    return data;
}

export async function addCompanyMember(companyId, payload) {
    const { data } = await api.post(`/companies/${companyId}/members`, payload);
    return data;
}

export async function removeCompanyMember(companyId, userId, role) {
    const { data } = await api.delete(`/companies/${companyId}/members/${userId}`, {
        params: clean({ role }),
    });
    return data;
}

export async function setCompanyMemberRole(companyId, userId, role, mode = 'replace') {
    const { data } = await api.patch(`/companies/${companyId}/members/${userId}`, { role, mode });
    return data;
}

export async function listCompanyCourses(companyId, { page = 1, limit = 20, q = '' } = {}) {
    const { data } = await api.get(`/companies/${companyId}/courses`, {
        params: clean({ page, limit, q }),
    });
    return data;
}
