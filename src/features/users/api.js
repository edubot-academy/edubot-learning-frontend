import toast from 'react-hot-toast';
import api from '../../shared/api/client';

export const fetchUsers = async ({ page, limit, search, role, dateFrom, dateTo }) => {
    try {
        const response = await api.get('/users', {
            params: { page, limit, search, role, dateFrom, dateTo },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUserRole = async (userId, newRole) => {
    try {
        const response = await api.patch(`/users/${userId}/role`, { role: newRole });
        toast.success('User role updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
        throw error;
    }
};
