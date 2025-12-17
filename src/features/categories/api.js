import toast from 'react-hot-toast';
import api from '../../shared/api/client';

export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};

export const fetchCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/categories/${categoryId}`);
        toast.success('Category deleted successfully');
        return response.data;
    } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
        throw error;
    }
};

export const updateCategory = async (categoryId, data) => {
    try {
        const response = await api.patch(`/categories/${categoryId}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating category:', error);
        toast.error('Failed to update category');
        throw error;
    }
};
