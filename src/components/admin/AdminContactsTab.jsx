import React from 'react';

const AdminContactsTab = ({ contacts }) => {
    return (
        <div className="bg-white shadow rounded p-4 mt-6">
            <h2 className="text-2xl font-semibold mb-4">Байланыш Каттары</h2>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">Аты</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Телефон</th>
                        <th className="p-2">Кат</th>
                        <th className="p-2">Келген күнү</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((c) => (
                        <tr key={c.id} className="border-b">
                            <td className="p-2">{c.name}</td>
                            <td className="p-2">{c.email}</td>
                            <td className="p-2">{c.phone}</td>
                            <td className="p-2">{c.message}</td>
                            <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminContactsTab;
