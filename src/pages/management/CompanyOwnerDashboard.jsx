import React, { useEffect, useState } from 'react';
import {
    getCompanyTeam,
    getCompanyStudents,
    getDirectors,
    createDirector,
    updateDirector,
    deleteDirector,
} from '../../services/api';
import toast from 'react-hot-toast';
import RegisterUserForm from '../../components/RegisterUserForm';

export const CompanyOwnerDashboard = () => {
    const [directors, setDirectors] = useState([]);
    const [students, setStudents] = useState([]);
    const [team, setTeam] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [editFormData, setEditFormData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [dir, stu, staff] = await Promise.all([
                getDirectors(),
                getCompanyStudents(),
                getCompanyTeam(),
            ]);
            setDirectors(dir.data);
            setStudents(stu.data);
            setTeam(staff.data);
        } catch (error) {
            toast.error('Маалыматтарды жүктөөдө ката кетти');
        }
    };

    const handleSubmit = async (form) => {
        if (editingId) {
            await handleUpdateDirector(editingId, form);
        } else {
            await handleCreateDirector(form);
        }
        setShowRegisterForm(false);
        setEditingId(null);
        setEditFormData(null);
    };

    const handleCreateDirector = async (data) => {
        try {
            await createDirector(data);
            toast.success('Директор кошулду');
            loadData();
        } catch (err) {
            toast.error('Директорду кошууда ката кетти');
        }
    };

    const handleUpdateDirector = async (id, data) => {
        try {
            await updateDirector(id, data);
            toast.success('Маалымат жаңыртылды');
            loadData();
        } catch (err) {
            toast.error('Жаңыртуу учурунда ката кетти');
        }
    };

    const handleDeleteDirector = async (id) => {
        toast((t) => (
            <div className="space-y-2">
                <p>Директорду чын эле өчүрүүнү каалайсызбы?</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteDirector(id);
                                toast.success('Директор өчүрүлдү');
                                loadData();
                            } catch (err) {
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
            <h2 className="text-xl font-bold">Компания ээсинин башкаруу панели</h2>

            <section className="space-y-4">
                <h3 className="font-semibold text-lg">Директор кошуу / өзгөртүү</h3>
                <button
                    onClick={() => {
                        setShowRegisterForm(true);
                        setEditFormData(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Жаңы директор кошуу
                </button>

                {showRegisterForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                            <button
                                onClick={() => {
                                    setShowRegisterForm(false);
                                    setEditingId(null);
                                    setEditFormData(null);
                                }}
                                className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
                            >×</button>
                            <RegisterUserForm
                                key={editingId || 'new'}
                                initialData={editFormData}
                                onRegister={handleSubmit}
                                onCancel={() => {
                                    setShowRegisterForm(false);
                                    setEditingId(null);
                                    setEditFormData(null);
                                }}
                            />
                        </div>
                    </div>
                )}
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Директорлор тизмеси</h3>
                {directors.length === 0 ? (
                    <p className="text-gray-500">Азырынча директор жок.</p>
                ) : (
                    <ul className="space-y-2">
                        {directors.map(d => (
                            <li key={d.id} className="flex items-center justify-between border p-2">
                                <span>{d.fullName} - {d.email}</span>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditFormData({
                                                fullName: d.fullName,
                                                email: d.email,
                                                phoneNumber: d.phoneNumber || '',
                                            });
                                            setEditingId(d.id);
                                            setShowRegisterForm(true);
                                        }}
                                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Түзөтүү
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDirector(d.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded"
                                    >
                                        Өчүрүү
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Компаниядагы студенттер</h3>
                {students.length === 0 ? (
                    <p className="text-gray-500">Азырынча студенттер жок.</p>
                ) : (
                    <ul className="list-disc pl-5">
                        {students.map(s => (
                            <li key={s.id}>{s.fullName} - {s.email}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h3 className="font-semibold text-lg mb-2">Менеджерлер, сатуучулар жана ассистенттер</h3>
                {team.length === 0 ? (
                    <p className="text-gray-500">Азырынча менеджерлер же ассистенттер жок.</p>
                ) : (
                    <ul className="list-disc pl-5">
                        {team.map(t => (
                            <li key={t.id}>{t.fullName} - {
                                t.role === 'sales.manager' ? 'Менеджер' :
                                    t.role === 'sales.director' ? 'Директор' :
                                        t.role === 'sales' ? 'Сатуучу' :
                                            t.role === 'assistant' ? 'Ассистент' : t.role
                            }</li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default CompanyOwnerDashboard;
