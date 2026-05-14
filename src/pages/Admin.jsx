import { AdminPanel } from '@features/admin';

// Route wrapper only. Keep admin state, data loading, and tab behavior in
// src/features/admin/pages/AdminPanel.jsx or feature-level admin modules.

const Admin = () => {
    return <AdminPanel />;
};

export default Admin;
