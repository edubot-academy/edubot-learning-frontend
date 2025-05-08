import React, { useEffect, useState } from 'react';
import {
    getManagers,
    createManager,
    updateManager,
    deleteManager,
    getDirectorStudents,
} from '../../services/api';
import toast from 'react-hot-toast';
import RegisterUserForm from '../../components/RegisterUserForm';

export const DirectorDashboard = () => {
    const [managers, setManagers] = useState([]);
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
    const [editingId, setEditingId] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [mgrs, studs] = await Promise.all([
                getManagers(),
                getDirectorStudents(),
            ]);
            setManagers(mgrs.data);
            setStudents(studs.data);
        } catch (err) {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        }
    };

    const handleSubmit = async (data) => {
        if (editingId) {
            await handleUpdateManager(editingId, data);
        } else {
            await handleCreateManager(data);
        }
        setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
        setEditingId(null);
        setShowFormModal(false);
    };

    const handleCreateManager = async (data) => {
        try {
            await createManager(data);
            toast.success('Менеджер ийгиликтүү кошулду');
            loadData();
        } catch {
            toast.error('Менеджерди кошууда ката кетти');
        }
    };

    const handleUpdateManager = async (id, data) => {
        try {
            await updateManager(id, data);
            toast.success('Маалымат жаңыртылды');
            loadData();
        } catch {
            toast.error('Жаңыртуу учурунда ката кетти');
        }
    };

    const handleDeleteManager = async (id) => {
        toast((t) => (
            <div className="space-y-2">
                <p>Менеджерди чын эле өчүрүүнү каалайсызбы?</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteManager(id);
                                toast.success('Менеджер өчүрүлдү');
                                loadData();
                            } catch {
                                toast.error('Өчүрүү учурунда ката кетти');
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
            <h2 className="text-xl font-bold">Директордун башкаруу панели</h2>

            <section className="space-y-4">
                <h3 className="font-semibold text-lg">Менеджер кошуу / өзгөртүү</h3>
                <button
                    onClick={() => {
                        setShowFormModal(true);
                        setForm({ fullName: '', email: '', phoneNumber: '', password: '' });
                        setEditingId(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Жаңы менеджер кошуу
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
                <h3 className="font-semibold text-lg mb-2">Менеджерлер тизмеси</h3>
                <ul className="space-y-2">
                    {managers.map(m => (
                        <li key={m.id} className="flex items-center justify-between border p-2">
                            <span>{m.fullName} - {m.email}</span>
                            <div className="space-x-2">
                                <button onClick={() => {
                                    setForm({
                                        fullName: m.fullName,
                                        email: m.email,
                                        phoneNumber: m.phoneNumber,
                                        password: ''
                                    });
                                    setEditingId(m.id);
                                    setShowFormModal(true);
                                }} className="px-2 py-1 bg-yellow-500 text-white rounded">Түзөтүү</button>
                                <button onClick={() => handleDeleteManager(m.id)} className="px-2 py-1 bg-red-600 text-white rounded">Өчүрүү</button>
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

export default DirectorDashboard;
