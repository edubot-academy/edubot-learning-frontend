import { useState } from 'react';
import toast from 'react-hot-toast';
import { linkParentToStudent } from '@services/api';

const TEXT = {
    ky: {
        title: 'Баланы байланыштыруу',
        studentId: 'Студент ID',
        code: 'Код',
        submit: 'Байланыштыруу',
        info: 'Студенттен же администратордон алган кодуңузду киргизиңиз.',
    },
    ru: {
        title: 'Привязать ребенка',
        studentId: 'ID студента',
        code: 'Код',
        submit: 'Привязать',
        info: 'Введите код, полученный от студента или администратора.',
    },
};

const ParentLink = () => {
    const [studentId, setStudentId] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const lang = 'ky';
    const copy = TEXT[lang] || TEXT.ky;

    const handleSubmit = async () => {
        if (!studentId || !code) {
            toast.error('ID жана код талап кылынат');
            return;
        }
        setLoading(true);
        try {
            await linkParentToStudent({ studentId, code });
            toast.success('Байланыш ийгиликтүү');
            setStudentId('');
            setCode('');
        } catch (error) {
            console.error('Failed to link parent', error);
            toast.error('Байланыштыруу мүмкүн болбоду');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-20 pb-10 max-w-md mx-auto px-4 space-y-4">
            <GlassCard className="p-5">
                <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
                <p className="text-sm text-gray-500">{copy.info}</p>
                <div className="space-y-3 mt-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">{copy.studentId}</label>
                        <input
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="rounded border border-gray-200 p-2"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">{copy.code}</label>
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="rounded border border-gray-200 p-2"
                        />
                    </div>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="w-full px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading ? '...' : copy.submit}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default ParentLink;
