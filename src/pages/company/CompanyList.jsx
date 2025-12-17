import React from 'react';
import { listCompanies, createCompany } from '@services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CompanyList() {
    const [q, setQ] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [data, setData] = React.useState({ items: [], totalPages: 1 });
    const [newName, setNewName] = React.useState('');

    React.useEffect(() => {
        (async () => {
            try {
                const data = await listCompanies({ page, q });
                setData(data);
            } catch {
                toast.error('Компанияларды жүктөөдө ката.');
            }
        })();
    }, [page, q]);

    const onCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await createCompany({ name: newName.trim() });
            setNewName('');
            setPage(1);
            setQ('');
            toast.success('Компания түзүлдү.');
            setData(await listCompanies({ page: 1, q: '' }));
        } catch {
            toast.error('Компания түзүү катасы.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Компаниялар</h1>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Издөө…"
                    className="border rounded px-3 py-1"
                />
            </div>

            <form onSubmit={onCreate} className="flex gap-2">
                <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Жаңы компаниянын аты"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Түзүү</button>
            </form>

            <ul className="space-y-3">
                {(data.items || []).map((c) => (
                    <li key={c.id} className="border rounded p-3 flex items-center justify-between">
                        <div>
                            <div className="font-semibold">{c.name}</div>
                            {c.about && (
                                <div className="text-sm text-gray-600 line-clamp-1">{c.about}</div>
                            )}
                        </div>
                        <Link to={`/companies/${c.id}`} className="text-blue-600 hover:underline">
                            Ачуу
                        </Link>
                    </li>
                ))}
                {(!data.items || data.items.length === 0) && (
                    <li className="text-center text-gray-500 p-6 border rounded">
                        Компаниялар табылган жок.
                    </li>
                )}
            </ul>

            <div className="flex gap-2 justify-center">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : ''}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}
