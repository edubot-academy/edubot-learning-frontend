import React from 'react';
import { publicCatalog } from '@services/api';
import { Link, useSearchParams } from 'react-router-dom';

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [q, setQ] = React.useState(searchParams.get('q') || '');
    const page = Number(searchParams.get('page') || 1);
    const [data, setData] = React.useState({ items: [], totalPages: 1 });

    React.useEffect(() => {
        (async () => {
            setData(await publicCatalog({ page, q }));
        })();
    }, [page, q]);

    React.useEffect(() => {
        const t = setTimeout(
            () =>
                setSearchParams((prev) => {
                    const sp = new URLSearchParams(prev);
                    if (q) sp.set('q', q);
                    else sp.delete('q');
                    sp.set('page', '1');
                    return sp;
                }),
            400
        );
        return () => clearTimeout(t);
    }, [q]);

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Каталог</h1>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Курстарды изде…"
                    className="border rounded px-3 py-1 text-black dark:text-white bg-white dark:bg-[#222222]"
                />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data.items || []).map((c) => (
                    <Link
                        to={`/courses/${c.id}`}
                        key={c.id}
                        className="block border rounded shadow hover:shadow-md transition"
                    >
                        {c.coverImageUrl && (
                            <img
                                src={c.coverImageUrl}
                                alt={c.title}
                                className="w-full h-40 object-cover rounded-t"
                            />
                        )}
                        <div className="p-3">
                            <div className="font-semibold line-clamp-2">{c.title}</div>
                            <div className="text-sm text-gray-600">
                                {c.instructor?.fullName || '—'}
                            </div>
                            {/* Optional: durationInHours, price */}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setSearchParams({ q, page: String(p) })}
                        className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-600 text-white' : ''}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}
