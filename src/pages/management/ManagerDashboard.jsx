import React, { useEffect, useState } from 'react';
import {
    getSalesUsers,
    createSalesUser,
    updateSalesUser,
    deleteSalesUser,
    getSalesStudents,
} from '../../services/api';
import toast from 'react-hot-toast';
import RegisterUserForm from '../../components/RegisterUserForm';

export const ManagerDashboard = () => {
    const [sales, setSales] = useState([]);
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
    const [editingId, setEditingId] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [salesList, studentsList] = await Promise.all([
                getSalesUsers(),
                getSalesStudents(),
            ]);
            setSales(salesList.data);
            setStudents(studentsList.data);
        } catch {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        }
    };

    const handleSubmit = async (data) => {
        if (editingId) {
            await handleUpdateSales(editingId, data);
        } else {
            await handleCreateSales(data);
        }
        setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
        setEditingId(null);
        setShowFormModal(false);
    };

    const handleCreateSales = async (data) => {
        try {
            await createSalesUser(data);
            toast.success('Сатуу менеджери кошулду');
            loadData();
        } catch {
            toast.error('Ката: кошуу мүмкүн болбоду');
        }
    };

    const handleUpdateSales = async (id, data) => {
        try {
            await updateSalesUser(id, data);
            toast.success('Маалымат жаңыртылды');
            loadData();
        } catch {
            toast.error('Жаңыртуу ишке ашкан жок');
        }
    };

    const handleDeleteSales = async (id) => {
        toast((t) => (
            <div className="space-y-2">
                <p>Сатуу кызматкерин чын эле өчүрүүнү каалайсызбы?</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteSalesUser(id);
                                toast.success('Сатуу менеджери өчүрүлдү');
                                loadData();
                            } catch {
                                toast.error('Өчүрүүдө ката кетти');
                            }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                    >Ооба</button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-gray-300 rounded"
                    >Жок</button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    return (
        <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold">Менеджер панелинен башкаруу</h2>

            <section className="space-y-4">
                <h3 className="font-semibold text-lg">Сатуу менеджерин кошуу / өзгөртүү</h3>
                <button
                    onClick={() => {
                        setShowFormModal(true);
                        setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
                        setEditingId(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Жаңы кызматкер кошуу
                </button>

                {showFormModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                            <button
                                onClick={() => {
                                    setShowFormModal(false);
                                    setEditingId(null);
                                }}
                                className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
                            >×</button>
                            <RegisterUserForm
                                key={editingId || 'new'}
                                initialData={editingId ? form : null}
                                onRegister={handleSubmit}
                                onCancel={() => setShowFormModal(false)}
                            />
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Сатуу командасы</h3>
                <ul className="space-y-2">
                    {sales.map(s => (
                        <li key={s.id} className="flex items-center justify-between border p-2">
                            <span>{s.fullName} - {s.email}</span>
                            <div className="space-x-2">
                                <button onClick={() => {
                                    setForm({
                                        fullName: s.fullName,
                                        email: s.email,
                                        phoneNumber: s.phoneNumber,
                                        password: ''
                                    });
                                    setEditingId(s.id);
                                    setShowFormModal(true);
                                }} className="px-2 py-1 bg-yellow-500 text-white rounded">Түзөтүү</button>
                                <button onClick={() => handleDeleteSales(s.id)} className="px-2 py-1 bg-red-600 text-white rounded">Өчүрүү</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Сатуу командасы каттаган студенттер</h3>
                <ul className="list-disc pl-5">
                    {students.map(s => (
                        <li key={s.id}>{s.fullName} - {s.email}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default ManagerDashboard;
